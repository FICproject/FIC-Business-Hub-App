package com.ficbusinesshubmobile.fcm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class MembershipNotificationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "Membership notification alarm fired with action: ${intent.action}")

        val notifId = intent.getStringExtra("notification_id") ?: "mem_alarm_${System.currentTimeMillis()}"
        val remainingDays = intent.getStringExtra("remaining_days") ?: "soon"
        val expiryDate = intent.getStringExtra("expiry_date") ?: "upcoming"
        val planName = intent.getStringExtra("plan_name") ?: "FIC Membership"

        // Execute delivery via scheduler
        MembershipNotificationScheduler.deliverReminder(
            context,
            notifId,
            remainingDays,
            expiryDate,
            planName
        )
    }

    companion object {
        private const val TAG = "MembershipReceiver"
    }
}
