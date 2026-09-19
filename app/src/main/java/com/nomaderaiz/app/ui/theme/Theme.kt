package com.nomaderaiz.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.luminance
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import com.nomaderaiz.app.data.AppAccent
import com.nomaderaiz.app.data.FontScale
import androidx.compose.ui.unit.dp

private fun accentColor(accent:AppAccent)=Color(accent.hex)

private fun foreground(background:Color)=if(background.luminance()>.179f)Color.Black else Color.White

internal fun appColors(dark:Boolean,accent:AppAccent):androidx.compose.material3.ColorScheme {
    val brand=accentColor(accent)
    val primary=if(dark)brand else lerp(brand,Color.Black,.36f)
    val background=if(dark)Color(0xFF061315) else Color(0xFFF5F7EF)
    val surface=if(dark)Color(0xFF0D1B1D) else Color.White
    val variant=if(dark)Color(0xFF142426) else Color(0xFFE7EBDF)
    val text=if(dark)Color(0xFFF2F4ED) else Color(0xFF18201A)
    val container=lerp(surface,brand,if(dark).24f else .18f)
    val base=if(dark)darkColorScheme() else lightColorScheme()
    return base.copy(
        primary=primary,onPrimary=foreground(primary),primaryContainer=container,onPrimaryContainer=text,
        secondary=primary,onSecondary=foreground(primary),secondaryContainer=container,onSecondaryContainer=text,
        tertiary=primary,onTertiary=foreground(primary),tertiaryContainer=container,onTertiaryContainer=text,
        background=background,onBackground=text,surface=surface,onSurface=text,
        surfaceVariant=variant,onSurfaceVariant=if(dark)Color(0xFFC0CCC5) else Color(0xFF46534A),
        surfaceTint=primary,
        surfaceDim=background,surfaceBright=variant,
        surfaceContainerLowest=background,surfaceContainerLow=surface,surfaceContainer=surface,
        surfaceContainerHigh=variant,surfaceContainerHighest=variant,
        outline=if(dark)Color(0xFF70827A) else Color(0xFF65746A),
        outlineVariant=if(dark)Color(0xFF2E403C) else Color(0xFFC3CDBF),
        inverseSurface=if(dark)Color(0xFFE4EBDE) else Color(0xFF22312A),
        inverseOnSurface=if(dark)Color(0xFF18201A) else Color(0xFFF2F4ED),
        inversePrimary=if(dark)lerp(brand,Color.Black,.36f) else brand,
        error=if(dark)Color(0xFFFFB4AB) else Color(0xFFBA1A1A),
        onError=if(dark)Color(0xFF690005) else Color.White,
        errorContainer=if(dark)Color(0xFF582320) else Color(0xFFFFDAD6),
        onErrorContainer=if(dark)Color(0xFFFFDAD6) else Color(0xFF410002)
    )
}

private val NomadeShapes=Shapes(
    extraSmall=RoundedCornerShape(8.dp),
    small=RoundedCornerShape(12.dp),
    medium=RoundedCornerShape(16.dp),
    large=RoundedCornerShape(22.dp),
    extraLarge=RoundedCornerShape(28.dp)
)

@Composable
fun NomadeRaizTheme(
    darkTheme:Boolean=true,
    fontScale:FontScale=FontScale.MD,
    accent:AppAccent=AppAccent.RAIZ,
    content:@Composable ()->Unit
){
    val current=LocalDensity.current
    val colors=remember(darkTheme,accent){appColors(darkTheme,accent)}
    val multiplier=when(fontScale){FontScale.SM->0.90f;FontScale.MD->1f;FontScale.LG->1.15f}
    CompositionLocalProvider(LocalDensity provides Density(current.density,current.fontScale*multiplier)) {
        MaterialTheme(
            colorScheme=colors,
            shapes=NomadeShapes,
            content=content
        )
    }
}
