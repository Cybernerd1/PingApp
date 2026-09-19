package com.ping

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

override fun onCreate(savedInstanceState: Bundle?) {
    // Switch from SplashTheme to AppTheme before super.onCreate.
    setTheme(R.style.AppTheme)
    super.onCreate(savedInstanceState)
  }

override fun getMainComponentName(): String = "Ping"

override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
