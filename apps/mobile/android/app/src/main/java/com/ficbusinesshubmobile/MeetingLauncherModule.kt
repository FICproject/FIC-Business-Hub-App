package com.ficbusinesshubmobile

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MeetingLauncherModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MeetingLauncherModule"
    }

    /**
     * Checks whether an Android application package is installed and whether it is enabled.
     * Returns:
     * - "ENABLED": Package is installed and active
     * - "DISABLED": Package is installed but disabled in Android settings
     * - "NOT_INSTALLED": Package is not installed on the device
     */
    @ReactMethod
    fun getAppStatus(packageName: String, promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val appInfo = pm.getApplicationInfo(packageName, 0)
            if (appInfo.enabled) {
                promise.resolve("ENABLED")
            } else {
                promise.resolve("DISABLED")
            }
        } catch (e: PackageManager.NameNotFoundException) {
            promise.resolve("NOT_INSTALLED")
        } catch (e: Exception) {
            promise.resolve("NOT_INSTALLED")
        }
    }

    /**
     * Backwards-compatible boolean check for package presence.
     */
    @ReactMethod
    fun isPackageInstalled(packageName: String, promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val appInfo = pm.getApplicationInfo(packageName, 0)
            promise.resolve(appInfo.enabled)
        } catch (e: PackageManager.NameNotFoundException) {
            promise.resolve(false)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    /**
     * Opens Android System Application Settings for the given package so the user can enable it.
     */
    @ReactMethod
    fun openAppSettings(packageName: String, promise: Promise) {
        try {
            val intent = Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (intent.resolveActivity(reactContext.packageManager) != null) {
                reactContext.startActivity(intent)
                promise.resolve(true)
                return
            }

            // Fallback to manage applications / general system settings
            val generalIntent = Intent(android.provider.Settings.ACTION_MANAGE_APPLICATIONS_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(generalIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", e.message ?: "Failed to open application settings")
        }
    }

    /**
     * Directly launches the assigned meeting using its original meeting URL inside the installed package.
     */
    @ReactMethod
    fun launchMeetingApp(packageName: String, meetingUrl: String, promise: Promise) {
        try {
            val uri = Uri.parse(meetingUrl)
            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                setPackage(packageName)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (intent.resolveActivity(reactContext.packageManager) != null) {
                reactContext.startActivity(intent)
                promise.resolve(true)
                return
            }

            // Fallback to package's launch intent with data URI
            val launchIntent = reactContext.packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.data = uri
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(launchIntent)
                promise.resolve(true)
                return
            }

            promise.resolve(false)
        } catch (e: Exception) {
            promise.reject("LAUNCH_FAILED", e.message ?: "Failed to launch meeting application")
        }
    }

    /**
     * Opens the exact official Google Play Store listing for the given package ID.
     */
    @ReactMethod
    fun openStoreListing(packageName: String, promise: Promise) {
        try {
            val marketUri = Uri.parse("market://details?id=$packageName")
            val marketIntent = Intent(Intent.ACTION_VIEW, marketUri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            if (marketIntent.resolveActivity(reactContext.packageManager) != null) {
                reactContext.startActivity(marketIntent)
                promise.resolve(true)
                return
            }

            val webUri = Uri.parse("https://play.google.com/store/apps/details?id=$packageName")
            val webIntent = Intent(Intent.ACTION_VIEW, webUri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(webIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STORE_OPEN_FAILED", e.message ?: "Failed to open Google Play Store")
        }
    }

    /**
     * Copies plain text to Android System Clipboard.
     */
    @ReactMethod
    fun copyToClipboard(text: String, promise: Promise) {
        try {
            val clipboard = reactContext.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
            val clip = android.content.ClipData.newPlainText("FIC Business Hub", text)
            clipboard.setPrimaryClip(clip)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}
