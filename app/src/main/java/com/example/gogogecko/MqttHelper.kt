package com.example.gogogecko

import android.content.Context
import org.eclipse.paho.android.service.MqttAndroidClient
import org.eclipse.paho.client.mqttv3.IMqttActionListener
import org.eclipse.paho.client.mqttv3.IMqttToken
import org.eclipse.paho.client.mqttv3.MqttConnectOptions
import org.eclipse.paho.client.mqttv3.MqttMessage

class MqttHelper(context: Context) {

    private val clientId = "DeliveryApp-" + System.currentTimeMillis()
    private val brokerHost = "f24f53fa64fe4683b1a503f541edbfcc.s1.eu.hivemq.cloud"
    private val brokerPort = 8883
    private val brokerUrl = "ssl://$brokerHost:$brokerPort"

    private val mqttClient = MqttAndroidClient(context.applicationContext, brokerUrl, clientId)

    private val options = MqttConnectOptions().apply {
        userName = "Admin"
        password = "Pikachu25".toCharArray()
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

    fun publish(topic: String, messageStr: String, qos: Int = 1) {
        val message = MqttMessage(messageStr.toByteArray()).apply { this.qos = qos }
        mqttClient.publish(topic, message)
    }

    fun subscribe(topic: String, qos: Int = 1, onMessageReceived: (String) -> Unit) {
        try {
            mqttClient.subscribe(topic, qos) { _, message ->
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
