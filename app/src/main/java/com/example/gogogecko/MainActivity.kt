package com.example.gogogecko

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import com.example.gogogecko.ui.theme.GoGoGeckoTheme

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

                // Connect to MQTT and subscribe to bot status
                LaunchedEffect(Unit) {
                    try {
                        mqttHelper.connect(
                            onConnected = { status = "Connected!" },
                            onFailure = { e -> status = "Failed: ${e.message}" }
                        )

                        mqttHelper.subscribe(
                            topic = "deliveryBot/1234/status",
                            onMessageReceived = { msg -> incomingMessages.add(msg) }
                        )
                    } catch (e: Exception) {
                        status = "MQTT Exception: ${e.message}"
                    }
                }


                DropoffScreen(
                    status = status,
                    messages = messages,
                    incomingMessages = incomingMessages,
                    onSend = { location ->
                        try {
                            mqttHelper.publishDropoff(location)
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
        if (::mqttHelper.isInitialized) {
            try {
                mqttHelper.disconnect()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        super.onDestroy()
    }
}