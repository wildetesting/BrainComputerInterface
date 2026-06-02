package com.localmovementdiary

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Duration
import java.time.LocalDate
import java.time.ZoneId

class HealthConnectSync(
    private val context: Context,
    private val store: MovementStore,
    private val zoneId: ZoneId = ZoneId.systemDefault(),
) {
    suspend fun syncDay(date: LocalDate = LocalDate.now(zoneId)): HealthSyncResult {
        val status = HealthConnectClient.getSdkStatus(context)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
            return HealthSyncResult.Unavailable("Health Connect is not available on this device.")
        }

        val client = HealthConnectClient.getOrCreate(context)
        val grantedPermissions = client.permissionController.getGrantedPermissions()
        val missingPermissions = REQUIRED_PERMISSIONS - grantedPermissions
        if (missingPermissions.isNotEmpty()) {
            return HealthSyncResult.NeedsPermissions(missingPermissions)
        }

        val start = date.atStartOfDay(zoneId).toInstant()
        val end = date.plusDays(1).atStartOfDay(zoneId).toInstant()
        val steps = client.aggregate(
            AggregateRequest(
                metrics = setOf(StepsRecord.COUNT_TOTAL),
                timeRangeFilter = TimeRangeFilter.between(start, end),
            ),
        )[StepsRecord.COUNT_TOTAL] ?: 0L

        val sleepRecords = client.readRecords(
            ReadRecordsRequest(
                recordType = SleepSessionRecord::class,
                timeRangeFilter = TimeRangeFilter.between(start, end),
            ),
        ).records

        val sleepSegments = sleepRecords.flatMap { record ->
            if (record.stages.isEmpty()) {
                listOf(
                    SleepSegment(
                        startTs = record.startTime.toEpochMilli(),
                        endTs = record.endTime.toEpochMilli(),
                        stage = "asleep",
                        source = record.metadata.dataOrigin.packageName,
                    ),
                )
            } else {
                record.stages.map { stage ->
                    SleepSegment(
                        startTs = stage.startTime.toEpochMilli(),
                        endTs = stage.endTime.toEpochMilli(),
                        stage = mapSleepStage(stage.stage),
                        source = record.metadata.dataOrigin.packageName,
                    )
                }
            }
        }

        val sleepMinutes = sleepSegments.sumOf {
            Duration.ofMillis((it.endTs - it.startTs).coerceAtLeast(0L)).toMinutes()
        }
        val sleepConfidence = when {
            sleepRecords.isEmpty() -> "none"
            sleepRecords.any { it.stages.isNotEmpty() } -> "staged"
            else -> "session"
        }
        val diaryText = DiaryNarrator.describe(steps, sleepMinutes, sleepConfidence)

        store.replaceSleepSegments(date, sleepSegments)
        store.upsertDailySummary(
            date = date,
            steps = steps,
            sleepMinutes = sleepMinutes,
            sleepConfidence = sleepConfidence,
            diaryText = diaryText,
        )
        return HealthSyncResult.Synced(steps, sleepMinutes, sleepConfidence)
    }

    private fun mapSleepStage(stage: Int): String {
        return when (stage) {
            1 -> "unknown"
            2 -> "awake"
            3 -> "sleeping"
            4 -> "out_of_bed"
            5 -> "light"
            6 -> "deep"
            7 -> "rem"
            else -> "stage_$stage"
        }
    }

    companion object {
        val REQUIRED_PERMISSIONS: Set<String> = setOf(
            HealthPermission.getReadPermission(StepsRecord::class),
            HealthPermission.getReadPermission(SleepSessionRecord::class),
        )
    }
}

sealed class HealthSyncResult {
    data class Synced(
        val steps: Long,
        val sleepMinutes: Long,
        val sleepConfidence: String,
    ) : HealthSyncResult()

    data class NeedsPermissions(val permissions: Set<String>) : HealthSyncResult()
    data class Unavailable(val reason: String) : HealthSyncResult()
}
