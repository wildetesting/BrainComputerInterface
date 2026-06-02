package com.localmovementdiary

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId

object DiaryScheduler {
    fun scheduleDailyEightPm(context: Context) {
        val alarmManager = context.getSystemService(AlarmManager::class.java)
        alarmManager.setInexactRepeating(
            AlarmManager.RTC_WAKEUP,
            nextEightPmMillis(),
            AlarmManager.INTERVAL_DAY,
            pendingIntent(context),
        )
    }

    private fun nextEightPmMillis(zoneId: ZoneId = ZoneId.systemDefault()): Long {
        val now = LocalDateTime.now(zoneId)
        var next = LocalDateTime.of(LocalDate.now(zoneId), LocalTime.of(20, 0))
        if (!next.isAfter(now)) {
            next = next.plusDays(1)
        }
        return next.atZone(zoneId).toInstant().toEpochMilli()
    }

    private fun pendingIntent(context: Context): PendingIntent {
        return PendingIntent.getBroadcast(
            context,
            2001,
            Intent(context, DiaryAlarmReceiver::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }
}
