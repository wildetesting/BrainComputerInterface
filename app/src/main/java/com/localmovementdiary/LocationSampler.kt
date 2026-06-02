package com.localmovementdiary

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

object LocationSampler {
    fun captureCurrentLocation(
        context: Context,
        store: MovementStore,
        onComplete: () -> Unit = {},
    ) {
        if (!hasLocationPermission(context)) {
            onComplete()
            return
        }

        val client = LocationServices.getFusedLocationProviderClient(context)
        val tokenSource = CancellationTokenSource()
        client.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, tokenSource.token)
            .addOnSuccessListener { location ->
                if (location != null) {
                    store.recordLocationPoint(
                        timestamp = location.time.takeIf { it > 0L } ?: System.currentTimeMillis(),
                        latitude = location.latitude,
                        longitude = location.longitude,
                        accuracy = location.accuracy,
                    )
                }
            }
            .addOnCompleteListener {
                onComplete()
            }
    }

    private fun hasLocationPermission(context: Context): Boolean {
        val fine = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION,
        ) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_COARSE_LOCATION,
        ) == PackageManager.PERMISSION_GRANTED
        return fine || coarse
    }
}
