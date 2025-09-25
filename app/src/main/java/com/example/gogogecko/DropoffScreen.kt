package com.example.gogogecko

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun DropoffScreen(
    status: String,
    messages: List<String>,
    incomingMessages: List<String>,
    onSend: (String) -> Unit
) {
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {

        Text(text = "Status: $status", style = MaterialTheme.typography.titleMedium)

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = { onSend("FrontDoor") }) {
            Text("Send Dropoff to FrontDoor")
        }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { onSend("BackDoor") }) {
            Text("Send Dropoff to BackDoor")
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Sent Messages:", style = MaterialTheme.typography.titleMedium)
        messages.forEach { Text(it) }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Incoming Messages:", style = MaterialTheme.typography.titleMedium)
        incomingMessages.forEach { Text(it) }
    }
}

