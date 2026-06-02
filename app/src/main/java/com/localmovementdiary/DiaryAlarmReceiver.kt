package com.localmovementdiary

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class DiaryAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            val store = MovementStore(context)
            val result = HealthConnectSync(context, store).syncDay()
            NotificationHelper.showDiaryReady(context, result)
            pendingResult.finish()
        }
    }
}
