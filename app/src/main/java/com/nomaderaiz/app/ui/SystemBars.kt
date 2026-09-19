package com.nomaderaiz.app.ui

import android.content.Context
import android.content.ContextWrapper
import android.graphics.Color
import android.os.Build
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.platform.LocalContext

private fun Context.activity(): ComponentActivity? = when (this) {
    is ComponentActivity -> this
    is ContextWrapper -> baseContext.activity()
    else -> null
}

@Composable
internal fun AppSystemBars(darkTheme: Boolean) {
    val activity = LocalContext.current.activity()
    DisposableEffect(activity, darkTheme) {
        val style = if (darkTheme) SystemBarStyle.dark(Color.TRANSPARENT)
        else SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT)
        activity?.enableEdgeToEdge(statusBarStyle = style, navigationBarStyle = style)
        if (Build.VERSION.SDK_INT >= 29) activity?.window?.isNavigationBarContrastEnforced = false
        onDispose { }
    }
}
