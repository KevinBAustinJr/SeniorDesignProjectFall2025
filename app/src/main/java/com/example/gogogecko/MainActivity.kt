package com.example.gogogecko

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.lifecycle.lifecycleScope
import com.example.gogogecko.ui.theme.GoGoGeckoTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var mqttHelper: MqttHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        mqttHelper = MqttHelper(this)

        setContent {
            GoGoGeckoTheme {

                var status by remember { mutableStateOf("Connecting...") }
                val messages = remember { mutableStateListOf<String>() }
                val incomingMessages = remember { mutableStateListOf<String>() }

                // Connect and subscribe
                LaunchedEffect(Unit) {
                    try {
                        mqttHelper.connect(
                            onConnected = { status = "Connected!" },
                            onFailure = { e -> status = "Failed: ${e.message}" }
                        )

                        mqttHelper.subscribe("deliveryBot/1234/status") { msg ->
                            incomingMessages.add(msg)
                        }
                    } catch (e: Exception) {
                        status = "MQTT Error: ${e.message}"
                    }
                }

                DropoffScreen(
                    status = status,
                    messages = messages,
                    incomingMessages = incomingMessages,
                    onSend = { location ->
                        try {
                            mqttHelper.publish("deliveryBot/1234/dropoff", location)
                            messages.add("Sent: $location")
                            status = "Sent $location"
                        } catch (e: Exception) {
                            status = "Send failed: ${e.message}"
                        }
                    }
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            mqttHelper.disconnect()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}

