package com.nomaderaiz.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Colors = darkColorScheme(
    primary = Color(0xFF91B51D),
    secondary = Color(0xFFE5A638),
    background = Color(0xFF071113),
    surface = Color(0xFF111B1C),
    surfaceVariant = Color(0xFF1A2423),
    onPrimary = Color.White,
    onBackground = Color(0xFFF2F4ED),
    onSurface = Color(0xFFF2F4ED)
)
@Composable fun NomadeRaizTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = Colors, content = content)
}
