package com.nomaderaiz.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import com.nomaderaiz.app.data.AppAccent
import com.nomaderaiz.app.data.FontScale

private fun accentColor(accent:AppAccent)=Color(accent.hex)

private fun darkColors(accent:AppAccent)=darkColorScheme(
    primary=accentColor(accent),
    secondary=accentColor(accent),
    background=Color(0xFF071113),
    surface=Color(0xFF111B1C),
    surfaceVariant=Color(0xFF1A2423),
    onPrimary=Color.White,
    onBackground=Color(0xFFF2F4ED),
    onSurface=Color(0xFFF2F4ED)
)

private fun lightColors(accent:AppAccent)=lightColorScheme(
    primary=accentColor(accent),
    secondary=accentColor(accent),
    background=Color(0xFFF5F7EF),
    surface=Color.White,
    surfaceVariant=Color(0xFFE7EBDF),
    onPrimary=Color.White,
    onBackground=Color(0xFF18201A),
    onSurface=Color(0xFF18201A)
)

@Composable
fun NomadeRaizTheme(
    darkTheme:Boolean=true,
    fontScale:FontScale=FontScale.MD,
    accent:AppAccent=AppAccent.RAIZ,
    content:@Composable ()->Unit
){
    val current=LocalDensity.current
    val multiplier=when(fontScale){FontScale.SM->0.90f;FontScale.MD->1f;FontScale.LG->1.15f}
    CompositionLocalProvider(LocalDensity provides Density(current.density,current.fontScale*multiplier)) {
        MaterialTheme(colorScheme=if(darkTheme)darkColors(accent) else lightColors(accent),content=content)
    }
}
