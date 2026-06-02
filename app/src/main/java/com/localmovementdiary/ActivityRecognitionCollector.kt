package com.localmovementdiary

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.ActivityRecognition

object ActivityRecognitionCollector {
    private const val DETECTION_INTERVAL_MS = 10 * 60 * 1000L

    fun start(context: Context) {
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACTIVITY_RECOGNITION,
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        ActivityRecognition.getClient(context).requestActivityUpdates(
            DETECTION_INTERVAL_MS,
            pendingIntent(context),
        )
    }

    fun stop(context: Context) {
        ActivityRecognition.getClient(context).removeActivityUpdates(pendingIntent(context))
    }

    private fun pendingIntent(context: Context): PendingIntent {
        val intent = Intent(context, ActivitySampleReceiver::class.java)
        return PendingIntent.getBroadcast(
            context,
            1001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE,
        )
    }
}
