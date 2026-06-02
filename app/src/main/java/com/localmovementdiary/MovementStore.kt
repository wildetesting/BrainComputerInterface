package com.localmovementdiary

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class MovementStore(context: Context) : SQLiteOpenHelper(
    context.applicationContext,
    DATABASE_NAME,
    null,
    DATABASE_VERSION,
) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE daily_summary (
                date TEXT PRIMARY KEY,
                steps INTEGER NOT NULL DEFAULT 0,
                sleep_minutes INTEGER NOT NULL DEFAULT 0,
                sleep_confidence TEXT NOT NULL DEFAULT 'unknown',
                diary_text TEXT NOT NULL DEFAULT '',
                updated_at INTEGER NOT NULL
            )
            """.trimIndent(),
        )
        db.execSQL(
            """
            CREATE TABLE activity_samples (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                activity_type TEXT NOT NULL,
                confidence INTEGER NOT NULL
            )
            """.trimIndent(),
        )
        db.execSQL(
            """
            CREATE TABLE location_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                accuracy REAL NOT NULL
            )
            """.trimIndent(),
        )
        db.execSQL(
            """
            CREATE TABLE sleep_segments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                start_ts INTEGER NOT NULL,
                end_ts INTEGER NOT NULL,
                stage TEXT NOT NULL,
                source TEXT NOT NULL
            )
            """.trimIndent(),
        )
        db.execSQL("CREATE INDEX idx_activity_timestamp ON activity_samples(timestamp)")
        db.execSQL("CREATE INDEX idx_location_timestamp ON location_points(timestamp)")
        db.execSQL("CREATE INDEX idx_sleep_date ON sleep_segments(date)")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS daily_summary")
        db.execSQL("DROP TABLE IF EXISTS activity_samples")
        db.execSQL("DROP TABLE IF EXISTS location_points")
        db.execSQL("DROP TABLE IF EXISTS sleep_segments")
        onCreate(db)
    }

    fun upsertDailySummary(
        date: LocalDate,
        steps: Long,
        sleepMinutes: Long,
        sleepConfidence: String,
        diaryText: String,
    ) {
        writableDatabase.execSQL(
            """
            INSERT OR REPLACE INTO daily_summary(date, steps, sleep_minutes, sleep_confidence, diary_text, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            arrayOf(
                date.toString(),
                steps,
                sleepMinutes,
                sleepConfidence,
                diaryText,
                System.currentTimeMillis(),
            ),
        )
    }

    fun recordActivitySample(timestamp: Long, activityType: String, confidence: Int) {
        writableDatabase.execSQL(
            "INSERT INTO activity_samples(timestamp, activity_type, confidence) VALUES (?, ?, ?)",
            arrayOf(timestamp, activityType, confidence),
        )
    }

    fun recordLocationPoint(timestamp: Long, latitude: Double, longitude: Double, accuracy: Float) {
        writableDatabase.execSQL(
            "INSERT INTO location_points(timestamp, latitude, longitude, accuracy) VALUES (?, ?, ?, ?)",
            arrayOf(timestamp, latitude, longitude, accuracy),
        )
    }

    fun replaceSleepSegments(date: LocalDate, segments: List<SleepSegment>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.execSQL("DELETE FROM sleep_segments WHERE date = ?", arrayOf(date.toString()))
            segments.forEach { segment ->
                db.execSQL(
                    """
                    INSERT INTO sleep_segments(date, start_ts, end_ts, stage, source)
                    VALUES (?, ?, ?, ?, ?)
                    """.trimIndent(),
                    arrayOf(
                        date.toString(),
                        segment.startTs,
                        segment.endTs,
                        segment.stage,
                        segment.source,
                    ),
                )
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun buildDiaryPayload(daysBack: Int = 30, zoneId: ZoneId = ZoneId.systemDefault()): String {
        val today = LocalDate.now(zoneId)
        val startDate = today.minusDays(daysBack.toLong() - 1)
        val startMillis = startDate.atStartOfDay(zoneId).toInstant().toEpochMilli()
        val endMillis = today.plusDays(1).atStartOfDay(zoneId).toInstant().toEpochMilli()

        return buildString {
            append("{")
            appendJsonField("generatedAt", Instant.now().toString())
            append(",")
            appendJsonField("today", today.toString())
            append(",\"localOnly\":true")
            append(",")
            appendJsonField(
                "sleepNote",
                "Sleep is read from Health Connect. Android phone-only sensing can infer rest, but accurate sleep usually needs a wearable or a trusted sleep app that writes to Health Connect.",
            )
            append(",\"days\":")
            appendDailySummaries(startDate, today)
            append(",\"activity\":")
            appendActivitySamples(startMillis, endMillis)
            append(",\"locations\":")
            appendLocationPoints(startMillis, endMillis)
            append(",\"sleep\":")
            appendSleepSegments(startDate, today)
            append("}")
        }
    }

    private fun StringBuilder.appendDailySummaries(start: LocalDate, end: LocalDate) {
        val rows = mutableMapOf<String, DailySummary>()
        readableDatabase.rawQuery(
            """
            SELECT date, steps, sleep_minutes, sleep_confidence, diary_text
            FROM daily_summary
            WHERE date >= ? AND date <= ?
            ORDER BY date ASC
            """.trimIndent(),
            arrayOf(start.toString(), end.toString()),
        ).use { cursor ->
            while (cursor.moveToNext()) {
                val summary = DailySummary(
                    date = cursor.getString(0),
                    steps = cursor.getLong(1),
                    sleepMinutes = cursor.getLong(2),
                    sleepConfidence = cursor.getString(3),
                    diaryText = cursor.getString(4),
                )
                rows[summary.date] = summary
            }
        }

        append("[")
        var current = start
        var first = true
        while (!current.isAfter(end)) {
            if (!first) append(",")
            first = false
            val summary = rows[current.toString()] ?: DailySummary(
                date = current.toString(),
                steps = 0,
                sleepMinutes = 0,
                sleepConfidence = "unknown",
                diaryText = "No local movement diary has been recorded yet.",
            )
            append("{")
            appendJsonField("date", summary.date)
            append(",\"steps\":").append(summary.steps)
            append(",\"sleepMinutes\":").append(summary.sleepMinutes)
            append(",")
            appendJsonField("sleepConfidence", summary.sleepConfidence)
            append(",")
            appendJsonField("diaryText", summary.diaryText)
            append("}")
            current = current.plusDays(1)
        }
        append("]")
    }

    private fun StringBuilder.appendActivitySamples(startMillis: Long, endMillis: Long) {
        readableDatabase.rawQuery(
            """
            SELECT timestamp, activity_type, confidence
            FROM activity_samples
            WHERE timestamp >= ? AND timestamp < ?
            ORDER BY timestamp ASC
            """.trimIndent(),
            arrayOf(startMillis.toString(), endMillis.toString()),
        ).use { cursor ->
            append("[")
            var first = true
            while (cursor.moveToNext()) {
                if (!first) append(",")
                first = false
                append("{\"timestamp\":").append(cursor.getLong(0))
                append(",")
                appendJsonField("type", cursor.getString(1))
                append(",\"confidence\":").append(cursor.getInt(2))
                append("}")
            }
            append("]")
        }
    }

    private fun StringBuilder.appendLocationPoints(startMillis: Long, endMillis: Long) {
        readableDatabase.rawQuery(
            """
            SELECT timestamp, latitude, longitude, accuracy
            FROM location_points
            WHERE timestamp >= ? AND timestamp < ?
            ORDER BY timestamp ASC
            """.trimIndent(),
            arrayOf(startMillis.toString(), endMillis.toString()),
        ).use { cursor ->
            append("[")
            var first = true
            while (cursor.moveToNext()) {
                if (!first) append(",")
                first = false
                append("{\"timestamp\":").append(cursor.getLong(0))
                append(",\"latitude\":").append(cursor.getDouble(1))
                append(",\"longitude\":").append(cursor.getDouble(2))
                append(",\"accuracy\":").append(cursor.getFloat(3))
                append("}")
            }
            append("]")
        }
    }

    private fun StringBuilder.appendSleepSegments(start: LocalDate, end: LocalDate) {
        readableDatabase.rawQuery(
            """
            SELECT date, start_ts, end_ts, stage, source
            FROM sleep_segments
            WHERE date >= ? AND date <= ?
            ORDER BY start_ts ASC
            """.trimIndent(),
            arrayOf(start.toString(), end.toString()),
        ).use { cursor ->
            append("[")
            var first = true
            while (cursor.moveToNext()) {
                if (!first) append(",")
                first = false
                append("{")
                appendJsonField("date", cursor.getString(0))
                append(",\"startTs\":").append(cursor.getLong(1))
                append(",\"endTs\":").append(cursor.getLong(2))
                append(",")
                appendJsonField("stage", cursor.getString(3))
                append(",")
                appendJsonField("source", cursor.getString(4))
                append("}")
            }
            append("]")
        }
    }

    private fun StringBuilder.appendJsonField(name: String, value: String) {
        append("\"").append(escapeJson(name)).append("\":\"").append(escapeJson(value)).append("\"")
    }

    private fun escapeJson(value: String): String {
        return buildString {
            value.forEach { char ->
                when (char) {
                    '\\' -> append("\\\\")
                    '"' -> append("\\\"")
                    '\n' -> append("\\n")
                    '\r' -> append("\\r")
                    '\t' -> append("\\t")
                    else -> append(char)
                }
            }
        }
    }

    companion object {
        private const val DATABASE_NAME = "movement_diary.db"
        private const val DATABASE_VERSION = 1
    }
}

data class SleepSegment(
    val startTs: Long,
    val endTs: Long,
    val stage: String,
    val source: String,
)

private data class DailySummary(
    val date: String,
    val steps: Long,
    val sleepMinutes: Long,
    val sleepConfidence: String,
    val diaryText: String,
)
