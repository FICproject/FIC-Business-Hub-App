package com.ficbusinesshubmobile.fcm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object MembershipNotificationScheduler {
    private const val TAG = "MembershipScheduler"
    private const val PREFS_NAME = "FIC_APP_STORAGE"
    private const val KEY_MEMBERSHIP_SCHEDULE = "FIC_MEMBERSHIP_SCHEDULE_DATA"
    private const val KEY_MEMBERSHIP_EXPIRY = "FIC_MEMBERSHIP_EXPIRY_DATE"
    private const val KEY_MEMBERSHIP_PLAN = "FIC_MEMBERSHIP_PLAN"
    private const val KEY_MEMBERSHIP_NOTIFS = "FIC_MEMBERSHIP_NOTIFICATIONS"
    private const val BASE_REQUEST_CODE = 9200

    data class ScheduledReminder(
        val id: String,
        val requestCode: Int,
        val targetMillis: Long,
        val remainingDaysLabel: String,
        val expiryDateLabel: String,
        val planName: String,
        val intervalLabel: String,
        val slotTimeLabel: String
    )

    private val kolkataTimeZone: TimeZone = TimeZone.getTimeZone("Asia/Kolkata")

    private fun parseExpiryDate(dateStr: String): Date? {
        val patterns = arrayOf(
            "dd MMM yyyy",
            "yyyy-MM-dd",
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss",
            "dd-MM-yyyy",
            "dd/MM/yyyy",
            "MMMM dd, yyyy"
        )
        for (pattern in patterns) {
            try {
                val sdf = SimpleDateFormat(pattern, Locale.ENGLISH).apply {
                    timeZone = kolkataTimeZone
                    isLenient = false
                }
                val parsed = sdf.parse(dateStr.trim())
                if (parsed != null) return parsed
            } catch (_: Exception) {}
        }
        return null
    }

    private fun formatDisplayDate(date: Date): String {
        val sdf = SimpleDateFormat("dd MMM yyyy", Locale.ENGLISH).apply {
            timeZone = kolkataTimeZone
        }
        return sdf.format(date)
    }

    /**
     * Builds the 10 scheduled reminder configurations based on the plan expiry date.
     * All times are in Asia/Kolkata timezone:
     * - 3 months before: 9:00 AM (1 notif)
     * - 1 month before: 9:00 AM (1 notif)
     * - 15 days before: 9:00 AM (1 notif)
     * - 7 days before: 9:00 AM (1 notif)
     * - 3 days before: 9:00 AM (1 notif)
     * - 2 days before: 9:00 AM and 6:00 PM (2 notifs)
     * - 1 day before: 9:00 AM, 1:00 PM, and 7:00 PM (3 notifs)
     * Total: 10 notifications
     */
    fun buildReminderSchedule(expiryDate: Date, planName: String): List<ScheduledReminder> {
        val expiryLabel = formatDisplayDate(expiryDate)
        val expiryCal = Calendar.getInstance(kolkataTimeZone).apply {
            time = expiryDate
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val list = mutableListOf<ScheduledReminder>()

        // Helper to construct a reminder at a specific delta and hour/minute
        fun addEntry(
            id: String,
            requestCodeOffset: Int,
            calendarField: Int,
            amount: Int,
            hourOfDay: Int,
            minute: Int,
            remainingDaysLabel: String,
            intervalLabel: String,
            slotTimeLabel: String
        ) {
            val triggerCal = expiryCal.clone() as Calendar
            triggerCal.add(calendarField, amount)
            triggerCal.set(Calendar.HOUR_OF_DAY, hourOfDay)
            triggerCal.set(Calendar.MINUTE, minute)
            triggerCal.set(Calendar.SECOND, 0)
            triggerCal.set(Calendar.MILLISECOND, 0)

            list.add(
                ScheduledReminder(
                    id = id,
                    requestCode = BASE_REQUEST_CODE + requestCodeOffset,
                    targetMillis = triggerCal.timeInMillis,
                    remainingDaysLabel = remainingDaysLabel,
                    expiryDateLabel = expiryLabel,
                    planName = planName,
                    intervalLabel = intervalLabel,
                    slotTimeLabel = slotTimeLabel
                )
            )
        }

        // 1. 3 months before @ 09:00 AM
        addEntry(
            id = "mem_rem_3m",
            requestCodeOffset = 1,
            calendarField = Calendar.MONTH,
            amount = -3,
            hourOfDay = 9,
            minute = 0,
            remainingDaysLabel = "3 months",
            intervalLabel = "3 months before expiry",
            slotTimeLabel = "09:00 AM"
        )

        // 2. 1 month before @ 09:00 AM
        addEntry(
            id = "mem_rem_1m",
            requestCodeOffset = 2,
            calendarField = Calendar.MONTH,
            amount = -1,
            hourOfDay = 9,
            minute = 0,
            remainingDaysLabel = "1 month",
            intervalLabel = "1 month before expiry",
            slotTimeLabel = "09:00 AM"
        )

        // 3. 15 days before @ 09:00 AM
        addEntry(
            id = "mem_rem_15d",
            requestCodeOffset = 3,
            calendarField = Calendar.DAY_OF_YEAR,
            amount = -15,
            hourOfDay = 9,
            minute = 0,
            remainingDaysLabel = "15 days",
            intervalLabel = "15 days before expiry",
            slotTimeLabel = "09:00 AM"
        )

        // 4. 7 days before @ 09:00 AM
        addEntry(
            id = "mem_rem_7d",
            requestCodeOffset = 4,
            calendarField = Calendar.DAY_OF_YEAR,
            amount = -7,
            hourOfDay = 9,
            minute = 0,
            remainingDaysLabel = "7 days",
            intervalLabel = "7 days before expiry",
            slotTimeLabel = "09:00 AM"
        )

        // 5. 3 days before @ 09:00 AM
        addEntry(
            id = "mem_rem_3d",
            requestCodeOffset = 5,
            calendarField = Calendar.DAY_OF_YEAR,
            amount = -3,
            hourOfDay = 9,
            minute = 0,
            remainingDaysLabel = "3 days",
            intervalLabel = "3 days before expiry",
            slotTimeLabel = "09:00 AM"
        )

        // 6. 2 days before (Slot 1) @ 09:00 AM
        addEntry(
            id = "mem_rem_2d_morning",
            requestCodeOffset = 6,
            calendarField = Calendar.DAY_OF_YEAR,
            amount = -2,
            hourOfDay = 9,
            minute = 0,
            remainingDaysLabel = "2 days",
            intervalLabel = "2 days before expiry (Morning)",
            slotTimeLabel = "09:00 AM"
        )

        // 7. 2 days before (Slot 2) @ 06:00 PM
        addEntry(
            id = "mem_rem_2d_evening",
            requestCodeOffset = 7,
            calendarField = Calendar.DAY_OF_YEAR,
            amount = -2,
            hourOfDay = 18,
            minute = 0,
            remainingDaysLabel = "2 days",
            intervalLabel = "2 days before expiry (Evening)",
            slotTimeLabel = "06:00 PM"
        )

        // 8. 1 day before (Slot 1) @ 09:00 AM
        addEntry(
            id = "mem_rem_1d_morning",
            requestCodeOffset = 8,
            calendarField = Calendar.DAY_OF_YEAR,
            amount = -1,
            hourOfDay = 9,
            minute = 0,
            remainingDaysLabel = "1 day",
            intervalLabel = "1 day before expiry (Morning)",
            slotTimeLabel = "09:00 AM"
        )

        // 9. 1 day before (Slot 2) @ 01:00 PM
        addEntry(
            id = "mem_rem_1d_afternoon",
            requestCodeOffset = 9,
            calendarField = Calendar.DAY_OF_YEAR,
            amount = -1,
            hourOfDay = 13,
            minute = 0,
            remainingDaysLabel = "1 day",
            intervalLabel = "1 day before expiry (Afternoon)",
            slotTimeLabel = "01:00 PM"
        )

        // 10. 1 day before (Slot 3) @ 07:00 PM
        addEntry(
            id = "mem_rem_1d_evening",
            requestCodeOffset = 10,
            calendarField = Calendar.DAY_OF_YEAR,
            amount = -1,
            hourOfDay = 19,
            minute = 0,
            remainingDaysLabel = "1 day",
            intervalLabel = "1 day before expiry (Evening)",
            slotTimeLabel = "07:00 PM"
        )

        return list
    }

    /**
     * Schedules the 10-notification reminder cycle using Android AlarmManager.
     * Cancels any previously scheduled cycle first.
     */
    fun scheduleReminders(context: Context, expiryDateString: String, planName: String): String {
        val parsedDate = parseExpiryDate(expiryDateString)
            ?: return JSONObject().apply {
                put("success", false)
                put("error", "Unable to parse expiry date: $expiryDateString")
            }.toString()

        // Cancel previous alarms
        cancelAllReminders(context)

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit()
            .putString(KEY_MEMBERSHIP_EXPIRY, expiryDateString)
            .putString(KEY_MEMBERSHIP_PLAN, planName)
            .apply()

        val reminders = buildReminderSchedule(parsedDate, planName)
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
        val now = System.currentTimeMillis()

        var scheduledCount = 0
        var pastCount = 0
        val scheduleArray = JSONArray()

        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        reminders.forEach { reminder ->
            val isFuture = reminder.targetMillis > now
            val status = if (isFuture) "SCHEDULED" else "PAST"

            if (isFuture && alarmManager != null) {
                val intent = Intent(context, MembershipNotificationReceiver::class.java).apply {
                    action = "com.ficbusinesshubmobile.ACTION_MEMBERSHIP_EXPIRY_ALARM"
                    putExtra("notification_id", reminder.id)
                    putExtra("remaining_days", reminder.remainingDaysLabel)
                    putExtra("expiry_date", reminder.expiryDateLabel)
                    putExtra("plan_name", reminder.planName)
                    putExtra("request_code", reminder.requestCode)
                }

                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    reminder.requestCode,
                    intent,
                    flags
                )

                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            reminder.targetMillis,
                            pendingIntent
                        )
                    } else {
                        alarmManager.setExact(
                            AlarmManager.RTC_WAKEUP,
                            reminder.targetMillis,
                            pendingIntent
                        )
                    }
                    scheduledCount++
                } catch (e: Exception) {
                    Log.e(TAG, "Error scheduling alarm ${reminder.id}: ${e.message}")
                }
            } else {
                pastCount++
            }

            val itemObj = JSONObject().apply {
                put("id", reminder.id)
                put("requestCode", reminder.requestCode)
                put("targetMillis", reminder.targetMillis)
                put("remainingDays", reminder.remainingDaysLabel)
                put("expiryDate", reminder.expiryDateLabel)
                put("interval", reminder.intervalLabel)
                put("slotTime", reminder.slotTimeLabel)
                put("status", status)
            }
            scheduleArray.put(itemObj)
        }

        // Save schedule configuration
        val summaryObj = JSONObject().apply {
            put("expiryDate", expiryDateString)
            put("formattedExpiry", formatDisplayDate(parsedDate))
            put("planName", planName)
            put("totalScheduleCount", reminders.size)
            put("activeScheduledCount", scheduledCount)
            put("pastCount", pastCount)
            put("updatedAt", System.currentTimeMillis())
            put("reminders", scheduleArray)
        }

        prefs.edit().putString(KEY_MEMBERSHIP_SCHEDULE, summaryObj.toString()).apply()

        Log.d(TAG, "Scheduled $scheduledCount membership reminders for expiry: $expiryDateString")
        return JSONObject().apply {
            put("success", true)
            put("scheduledCount", scheduledCount)
            put("pastCount", pastCount)
            put("totalCount", reminders.size)
            put("data", summaryObj)
        }.toString()
    }

    /**
     * Cancels all pending membership reminder alarms.
     */
    fun cancelAllReminders(context: Context): Boolean {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return false
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        for (code in BASE_REQUEST_CODE..(BASE_REQUEST_CODE + 15)) {
            try {
                val intent = Intent(context, MembershipNotificationReceiver::class.java)
                val pendingIntent = PendingIntent.getBroadcast(context, code, intent, flags)
                alarmManager.cancel(pendingIntent)
                pendingIntent.cancel()
            } catch (e: Exception) {
                Log.w(TAG, "Error cancelling intent $code: ${e.message}")
            }
        }

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(KEY_MEMBERSHIP_SCHEDULE).apply()
        Log.d(TAG, "All membership reminder alarms cancelled.")
        return true
    }

    /**
     * Delivers a reminder:
     * 1. Displays real Android push notification.
     * 2. Saves delivered notification in SharedPreferences for in-app Notifications tab.
     * 3. Emits event to JS if app is open.
     */
    fun deliverReminder(
        context: Context,
        notifId: String,
        remainingDays: String,
        expiryDate: String,
        planName: String
    ) {
        val title = "FIC Business Hub – Membership Renewal Reminder"
        val message = "Your FIC Business Hub membership will expire in $remainingDays. Renew your membership before $expiryDate to continue accessing your membership benefits."

        val data = mapOf(
            "screen" to "Membership & Payments",
            "module" to "Membership & Payments",
            "type" to "MEMBERSHIP_RENEWAL",
            "expiryDate" to expiryDate,
            "remainingDays" to remainingDays,
            "notificationId" to notifId,
            "planName" to planName
        )

        // Show push notification in Android notification drawer
        FCMNotificationHelper.showNotification(context, title, message, data)

        // Persist delivered notification in in-app notification database
        saveDeliveredNotification(context, notifId, title, message, remainingDays, expiryDate, planName)

        // Update schedule item status
        markScheduleItemDelivered(context, notifId)

        // Notify JS if foreground
        FCMModule.sendNotificationReceivedEvent(title, message, data)
    }

    /**
     * Persists delivered notification for in-app display, ensuring no duplicate entries.
     */
    fun saveDeliveredNotification(
        context: Context,
        notifId: String,
        title: String,
        body: String,
        remainingDays: String,
        expiryDate: String,
        planName: String
    ) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val notifsRaw = prefs.getString(KEY_MEMBERSHIP_NOTIFS, "[]")
        val array = try {
            JSONArray(notifsRaw)
        } catch (_: Exception) {
            JSONArray()
        }

        // Check if already delivered with this id
        for (i in 0 until array.length()) {
            val item = array.optJSONObject(i)
            if (item != null && item.optString("id") == notifId) {
                // Already stored, do not duplicate
                return
            }
        }

        val timeSdf = SimpleDateFormat("dd MMM yyyy • hh:mm a", Locale.ENGLISH).apply {
            timeZone = kolkataTimeZone
        }
        val timestamp = timeSdf.format(Date())

        val newObj = JSONObject().apply {
            put("id", notifId)
            put("title", title)
            put("body", body)
            put("timestamp", timestamp)
            put("read", false)
            put("type", "MEMBERSHIP")
            put("action", "Renew Membership")
            put("expiryDate", expiryDate)
            put("remainingDays", remainingDays)
            put("planName", planName)
            put("screen", "Membership & Payments")
            put("createdAt", System.currentTimeMillis())
        }

        val newArray = JSONArray()
        newArray.put(newObj)
        for (i in 0 until minOf(array.length(), 49)) {
            newArray.put(array.get(i))
        }

        prefs.edit().putString(KEY_MEMBERSHIP_NOTIFS, newArray.toString()).apply()
        Log.d(TAG, "Saved delivered notification: $notifId to $KEY_MEMBERSHIP_NOTIFS")
    }

    private fun markScheduleItemDelivered(context: Context, notifId: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val scheduleStr = prefs.getString(KEY_MEMBERSHIP_SCHEDULE, null) ?: return
        try {
            val scheduleObj = JSONObject(scheduleStr)
            val remindersArray = scheduleObj.optJSONArray("reminders") ?: return
            for (i in 0 until remindersArray.length()) {
                val item = remindersArray.optJSONObject(i)
                if (item != null && item.optString("id") == notifId) {
                    item.put("status", "DELIVERED")
                    item.put("deliveredAt", System.currentTimeMillis())
                }
            }
            prefs.edit().putString(KEY_MEMBERSHIP_SCHEDULE, scheduleObj.toString()).apply()
        } catch (e: Exception) {
            Log.w(TAG, "Error updating schedule status: ${e.message}")
        }
    }

    /**
     * Trigger an instant real notification on demand (useful for testing on connected devices).
     */
    fun triggerImmediateTestReminder(context: Context, remainingDays: String): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val expiryDate = prefs.getString(KEY_MEMBERSHIP_EXPIRY, "05 Nov 2027") ?: "05 Nov 2027"
        val planName = prefs.getString(KEY_MEMBERSHIP_PLAN, "FIC Enterprise Membership") ?: "FIC Enterprise Membership"
        val notifId = "mem_test_${System.currentTimeMillis()}"

        deliverReminder(context, notifId, remainingDays, expiryDate, planName)
        return notifId
    }

    /**
     * Restores pending alarms after device reboot (BOOT_COMPLETED).
     */
    fun restoreScheduleOnBoot(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val expiryDate = prefs.getString(KEY_MEMBERSHIP_EXPIRY, null) ?: return
        val planName = prefs.getString(KEY_MEMBERSHIP_PLAN, "FIC Membership") ?: "FIC Membership"

        Log.d(TAG, "Restoring membership reminders for expiry: $expiryDate")
        scheduleReminders(context, expiryDate, planName)
    }

    /**
     * Returns the full schedule and delivery status as JSON string.
     */
    fun getScheduleStatus(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val schedule = prefs.getString(KEY_MEMBERSHIP_SCHEDULE, null)
        val notifs = prefs.getString(KEY_MEMBERSHIP_NOTIFS, "[]")

        return JSONObject().apply {
            put("schedule", if (schedule != null) JSONObject(schedule) else JSONObject.NULL)
            put("deliveredNotifications", JSONArray(notifs))
        }.toString()
    }
}

