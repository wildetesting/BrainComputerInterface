package com.localmovementdiary

import android.Manifest
import android.os.Build
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    private val scope: CoroutineScope = MainScope()
    private lateinit var store: MovementStore
    private lateinit var healthSync: HealthConnectSync
    private lateinit var webView: WebView

    private val runtimePermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) {
        ActivityRecognitionCollector.start(this)
        LocationSampler.captureCurrentLocation(this, store)
        requestHealthPermissionsIfNeeded()
    }

    private val healthPermissionLauncher = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract(),
    ) {
        syncTodayAndReload()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        store = MovementStore(this)
        healthSync = HealthConnectSync(this, store)
        webView = WebView(this)
        configureWebView(webView)
        setContentView(webView)

        DiaryScheduler.scheduleDailyEightPm(this)
        requestRuntimePermissions()
        syncTodayAndReload()
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }

    fun syncTodayAndReload() {
        scope.launch {
            withContext(Dispatchers.IO) {
                healthSync.syncDay()
            }
            webView.evaluateJavascript("window.MovementDiaryApp && window.MovementDiaryApp.reload()", null)
        }
    }

    private fun configureWebView(view: WebView) {
        view.webViewClient = WebViewClient()
        view.settings.javaScriptEnabled = true
        view.settings.allowFileAccess = true
        view.settings.domStorageEnabled = false
        view.settings.blockNetworkLoads = true
        view.addJavascriptInterface(
            MovementDiaryBridge(store) {
                syncTodayAndReload()
            },
            "MovementDiary",
        )
        view.loadUrl("file:///android_asset/dashboard/index.html")
    }

    private fun requestRuntimePermissions() {
        val permissions = buildList {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                add(Manifest.permission.ACTIVITY_RECOGNITION)
            }
            add(Manifest.permission.ACCESS_COARSE_LOCATION)
            add(Manifest.permission.ACCESS_FINE_LOCATION)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }.toTypedArray()
        runtimePermissionLauncher.launch(permissions)
    }

    private fun requestHealthPermissionsIfNeeded() {
        scope.launch {
            val missingPermissions = withContext(Dispatchers.IO) {
                if (HealthConnectClient.getSdkStatus(this@MainActivity) != HealthConnectClient.SDK_AVAILABLE) {
                    emptySet()
                } else {
                    val granted = HealthConnectClient.getOrCreate(this@MainActivity)
                        .permissionController
                        .getGrantedPermissions()
                    HealthConnectSync.REQUIRED_PERMISSIONS - granted
                }
            }
            if (missingPermissions.isNotEmpty()) {
                healthPermissionLauncher.launch(missingPermissions)
            } else {
                syncTodayAndReload()
            }
        }
    }
}
