package com.example.gogogecko

import android.content.Context
import org.eclipse.paho.android.service.MqttAndroidClient
import org.eclipse.paho.client.mqttv3.*

class MqttHelper(context: Context) {

    private val clientId = "DeliveryApp-" + System.currentTimeMillis()
    private val brokerUrl = "ssl://f24f53fa64fe4683b1a503f541edbfcc.s1.eu.hivemq.cloud:8883"

    private val mqttClient =
        MqttAndroidClient(context.applicationContext, brokerUrl, clientId)

    private val options = MqttConnectOptions().apply {
        userName = "yourMqttUser"            // replace with your MQTT username
        password = "yourMqttPassword".toCharArray() // replace with your MQTT password
        isAutomaticReconnect = true
        isCleanSession = true
    }

    fun connect(onConnected: () -> Unit, onFailure: (Throwable) -> Unit) {
        mqttClient.connect(options, null, object : IMqttActionListener {
            override fun onSuccess(asyncActionToken: IMqttToken?) = onConnected()
            override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) =
                onFailure(exception ?: Exception("Unknown error"))
        })
    }

    fun publishDropoff(location: String) {
        val topic = "deliveryBot/1234/dropoff"
        val message = MqttMessage(location.toByteArray()).apply { qos = 1 }
        mqttClient.publish(topic, message)
    }

    fun subscribe(topic: String, onMessageReceived: (String) -> Unit) {
        try {
            mqttClient.subscribe(topic, 1) { _, message ->
                onMessageReceived(message.toString())
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun disconnect() {
        mqttClient.disconnect()
    }
}
