package com.ficbusinesshubmobile.fcm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootCompletedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d(TAG, "Device rebooted: restoring membership renewal reminders")
            MembershipNotificationScheduler.restoreScheduleOnBoot(context)
        }
    }

    companion object {
        private const val TAG = "BootCompletedReceiver"
    }
}
