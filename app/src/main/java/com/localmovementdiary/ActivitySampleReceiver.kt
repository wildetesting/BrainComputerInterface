package com.localmovementdiary

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.ActivityRecognitionResult
import com.google.android.gms.location.DetectedActivity

class ActivitySampleReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val result = ActivityRecognitionResult.extractResult(intent) ?: return
        val activity = result.mostProbableActivity ?: return
        val store = MovementStore(context)
        store.recordActivitySample(
            timestamp = System.currentTimeMillis(),
            activityType = mapActivity(activity.type),
            confidence = activity.confidence,
        )

        val pendingResult = goAsync()
        LocationSampler.captureCurrentLocation(context, store) {
            pendingResult.finish()
        }
    }

    private fun mapActivity(type: Int): String {
        return when (type) {
            DetectedActivity.IN_VEHICLE -> "vehicle"
            DetectedActivity.ON_BICYCLE -> "cycling"
            DetectedActivity.ON_FOOT -> "on_foot"
            DetectedActivity.RUNNING -> "running"
            DetectedActivity.STILL -> "still"
            DetectedActivity.TILTING -> "tilting"
            DetectedActivity.WALKING -> "walking"
            DetectedActivity.UNKNOWN -> "unknown"
            else -> "unknown"
        }
    }
}
