package com.ficbusinesshubmobile

import android.content.Intent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.ficbusinesshubmobile.fcm.FCMModule

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "FICBusinessHubMobile"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
    FCMModule.handleNotificationIntent(intent)
  }
}

