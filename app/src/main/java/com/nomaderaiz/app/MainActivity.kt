package com.nomaderaiz.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.nomaderaiz.app.ui.NomadeRaizApp
import com.nomaderaiz.app.ui.theme.NomadeRaizTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { NomadeRaizTheme { NomadeRaizApp() } }
    }
}
