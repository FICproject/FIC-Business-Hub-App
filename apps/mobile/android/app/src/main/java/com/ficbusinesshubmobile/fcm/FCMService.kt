package com.ficbusinesshubmobile.fcm

import android.content.Context
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class FCMService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM Token received: $token")
        
        // Save to SharedPreferences for instant retrieval
        val prefs = applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_FCM_TOKEN, token).apply()

        // Forward to React Native if context is ready
        FCMModule.sendTokenRefreshEvent(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "FCM Message received from: ${remoteMessage.from}")

        val data = remoteMessage.data
        var title = remoteMessage.notification?.title ?: data["title"] ?: "FIC Business Hub"
        var body = remoteMessage.notification?.body ?: data["body"] ?: "You have a new activity update."

        // If the app is active in the foreground, notify JS
        val isForeground = FCMModule.isAppInForeground()
        if (isForeground) {
            Log.d(TAG, "App is in foreground, sending event to JS")
            FCMModule.sendNotificationReceivedEvent(title, body, data)
        } else {
            Log.d(TAG, "App is background/killed, showing native system notification")
            FCMNotificationHelper.showNotification(applicationContext, title, body, data)
        }
    }

    companion object {
        private const val TAG = "FCMService"
        const val PREFS_NAME = "fic_fcm_prefs"
        const val KEY_FCM_TOKEN = "fic_fcm_device_token"
    }
}

