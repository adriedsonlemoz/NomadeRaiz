package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

internal fun categoryIcon(id:String):ImageVector=when(id){
    "mobilidade"->Icons.Outlined.DirectionsBike
    "abrigo"->Icons.Outlined.Terrain
    "cozinha"->Icons.Outlined.Restaurant
    "agua"->Icons.Outlined.WaterDrop
    "energia"->Icons.Outlined.Bolt
    "tecnologia"->Icons.Outlined.Videocam
    "ferramentas"->Icons.Outlined.Build
    "seguranca"->Icons.Outlined.Shield
    "vestuario"->Icons.Outlined.Checkroom
    else->Icons.Outlined.MedicalServices
}

internal fun destinationIcon(screen:Screen):ImageVector=when(screen){
    Screen.Planning->Icons.Outlined.Explore
    Screen.Manual->Icons.Outlined.DirectionsBike
    Screen.Calculator->Icons.Outlined.Calculate
    Screen.Points->Icons.Outlined.Place
    Screen.Alerts->Icons.Outlined.Notifications
    Screen.Tips->Icons.Outlined.Lightbulb
    Screen.Settings->Icons.Outlined.Settings
    Screen.Gear->Icons.Outlined.Backpack
    else->Icons.Outlined.Info
}

@Composable
internal fun AppSymbol(symbol:String,modifier:Modifier=Modifier){
    val icon=when(symbol){
        "🚲","🚴"->Icons.Outlined.DirectionsBike
        "💧"->Icons.Outlined.WaterDrop
        "⚡","🔋"->Icons.Outlined.Bolt
        "🧰","🛠️","🔧"->Icons.Outlined.Build
        "🎒","⚖️"->Icons.Outlined.Backpack
        "🏕️","⛺"->Icons.Outlined.Terrain
        "🛒"->Icons.Outlined.ShoppingCart
        "🏥","🩹"->Icons.Outlined.MedicalServices
        "🦺","🛡️"->Icons.Outlined.Shield
        "🧭","🗺️"->Icons.Outlined.Explore
        "📍","📌"->Icons.Outlined.Place
        "🍱","🍳","🍚","🥣","🍝","🥫","🥜"->Icons.Outlined.Restaurant
        "💰","🧾"->Icons.Outlined.Payments
        "👕"->Icons.Outlined.Checkroom
        "✅"->Icons.Outlined.CheckCircle
        "⚠️","🔴","❌"->Icons.Outlined.WarningAmber
        "🌧️"->Icons.Outlined.Umbrella
        else->Icons.Outlined.Info
    }
    Icon(icon,contentDescription=null,modifier=modifier.size(26.dp),tint=MaterialTheme.colorScheme.primary)
}
