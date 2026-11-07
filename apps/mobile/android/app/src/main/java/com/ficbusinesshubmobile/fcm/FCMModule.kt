package com.ficbusinesshubmobile.fcm

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import com.google.firebase.messaging.FirebaseMessaging

class FCMModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), PermissionListener {

    private var permissionPromise: Promise? = null

    override fun getName(): String = "FCMModule"

    override fun initialize() {
        super.initialize()
        instance = this
        // Ensure high-priority notification channel is created on app initialization
        FCMNotificationHelper.createNotificationChannel(reactContext)
    }

    override fun invalidate() {
        super.invalidate()
        if (instance == this) {
            instance = null
        }
    }

    @ReactMethod
    fun getFCMToken(promise: Promise) {
        try {
            // First check cached token
            val prefs = reactContext.getSharedPreferences(FCMService.PREFS_NAME, Context.MODE_PRIVATE)
            val cachedToken = prefs.getString(FCMService.KEY_FCM_TOKEN, null)

            FirebaseMessaging.getInstance().token
                .addOnCompleteListener { task ->
                    if (!task.isSuccessful) {
                        Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                        if (cachedToken != null) {
                            promise.resolve(cachedToken)
                        } else {
                            promise.reject("FCM_ERROR", task.exception?.message ?: "Failed to get token")
                        }
                        return@addOnCompleteListener
                    }
                    val token = task.result
                    Log.d(TAG, "FCM Token retrieved: $token")
                    prefs.edit().putString(FCMService.KEY_FCM_TOKEN, token).apply()
                    promise.resolve(token)
                }
        } catch (e: Exception) {
            promise.reject("FCM_EXCEPTION", e.message)
        }
    }

    @ReactMethod
    fun requestNotificationPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val status = ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.POST_NOTIFICATIONS
            )
            if (status == PackageManager.PERMISSION_GRANTED) {
                promise.resolve(true)
            } else {
                val currentActivity = currentActivity
                if (currentActivity is PermissionAwareActivity) {
                    permissionPromise = promise
                    currentActivity.requestPermissions(
                        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                        REQUEST_CODE_POST_NOTIFICATIONS,
                        this
                    )
                } else {
                    promise.resolve(false)
                }
            }
        } else {
            // Android 12 and below automatically grant notification permissions
            promise.resolve(true)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ): Boolean {
        if (requestCode == REQUEST_CODE_POST_NOTIFICATIONS) {
            val granted = grantResults.isNotEmpty() &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED
            permissionPromise?.resolve(granted)
            permissionPromise = null
            return true
        }
        return false
    }

    @ReactMethod
    fun getInitialNotification(promise: Promise) {
        val activity = currentActivity
        val intent = activity?.intent
        if (intent != null && intent.getBooleanExtra("fcm_opened", false)) {
            val map = Arguments.createMap()
            map.putString("title", intent.getStringExtra("fcm_title") ?: "")
            map.putString("body", intent.getStringExtra("fcm_body") ?: "")
            
            // Extract custom data keys
            val dataMap = Arguments.createMap()
            val extras = intent.extras
            extras?.keySet()?.forEach { key ->
                if (key.startsWith("fcm_") && key != "fcm_opened" && key != "fcm_title" && key != "fcm_body") {
                    val rawKey = key.removePrefix("fcm_")
                    dataMap.putString(rawKey, extras.getString(key) ?: "")
                }
            }
            map.putMap("data", dataMap)

            // Clear so it doesn't fire multiple times
            intent.removeExtra("fcm_opened")
            promise.resolve(map)
        } else {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native built-in Event Emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for React Native built-in Event Emitter
    }

    companion object {
        private const val TAG = "FCMModule"
        private const val REQUEST_CODE_POST_NOTIFICATIONS = 8801
        private var instance: FCMModule? = null

        fun isAppInForeground(): Boolean {
            val act = instance?.currentActivity
            return act != null && !act.isFinishing && !act.isDestroyed
        }

        fun sendNotificationReceivedEvent(title: String, body: String, data: Map<String, String>) {
            val context = instance?.reactContext ?: return
            if (!context.hasActiveReactInstance()) return

            val payload = Arguments.createMap().apply {
                putString("title", title)
                putString("body", body)
                val dataMap = Arguments.createMap()
                data.forEach { (k, v) -> dataMap.putString(k, v) }
                putMap("data", dataMap)
            }

            try {
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onFCMMessageReceived", payload)
            } catch (e: Exception) {
                Log.e(TAG, "Error emitting onFCMMessageReceived", e)
            }
        }

        fun sendNotificationOpenedEvent(title: String, body: String, data: Map<String, String>) {
            val context = instance?.reactContext ?: return
            if (!context.hasActiveReactInstance()) return

            val payload = Arguments.createMap().apply {
                putString("title", title)
                putString("body", body)
                val dataMap = Arguments.createMap()
                data.forEach { (k, v) -> dataMap.putString(k, v) }
                putMap("data", dataMap)
            }

            try {
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onFCMNotificationOpened", payload)
            } catch (e: Exception) {
                Log.e(TAG, "Error emitting onFCMNotificationOpened", e)
            }
        }

        fun sendTokenRefreshEvent(token: String) {
            val context = instance?.reactContext ?: return
            if (!context.hasActiveReactInstance()) return

            try {
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onFCMTokenRefresh", token)
            } catch (e: Exception) {
                Log.e(TAG, "Error emitting onFCMTokenRefresh", e)
            }
        }

        fun handleNotificationIntent(intent: Intent?) {
            if (intent == null || !intent.getBooleanExtra("fcm_opened", false)) return

            val title = intent.getStringExtra("fcm_title") ?: ""
            val body = intent.getStringExtra("fcm_body") ?: ""
            val data = mutableMapOf<String, String>()

            intent.extras?.keySet()?.forEach { key ->
                if (key.startsWith("fcm_") && key != "fcm_opened" && key != "fcm_title" && key != "fcm_body") {
                    val rawKey = key.removePrefix("fcm_")
                    data[rawKey] = intent.extras?.getString(key) ?: ""
                }
            }

            // Remove extra to avoid duplicate handling
            intent.removeExtra("fcm_opened")
            sendNotificationOpenedEvent(title, body, data)
        }
    }
}
