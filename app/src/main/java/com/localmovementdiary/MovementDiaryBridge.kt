package com.localmovementdiary

import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface

class MovementDiaryBridge(
    private val store: MovementStore,
    private val refresh: () -> Unit,
) {
    @JavascriptInterface
    fun getDiaryJson(): String {
        return store.buildDiaryPayload(daysBack = 30)
    }

    @JavascriptInterface
    fun refreshFromPhone() {
        Handler(Looper.getMainLooper()).post {
            refresh()
        }
    }
}
