#include <WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "F54";                     // Replace with your WiFi
const char* password = "Aayush Pandey";       // Replace with your password
const char* host = "192.168.233.105";         // WSL IP
const uint16_t port = 5000;                   // Python server port

const int xPin = 34;
const int yPin = 35;
const int zPin = 32;

WebSocketsClient webSocket;

unsigned long previousMillis = 0;
const long interval = 20;  // 20 milliseconds = 50Hz

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_CONNECTED:
      Serial.println("✅ Connected to WebSocket server");
      break;
    case WStype_DISCONNECTED:
      Serial.println("❌ Disconnected from WebSocket server");
      break;
    case WStype_TEXT:
      Serial.printf("➡  Received: %s\n", payload);
      break;
  }
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected");
  Serial.println("📡 ESP32 IP Address: " + WiFi.localIP().toString());

  webSocket.begin(host, port, "/"); // Make sure path is "/"
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();  // keep WebSocket alive and responsive

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    int xVal = analogRead(xPin);
    int yVal = analogRead(yPin);
    int zVal = analogRead(zPin);

    String data = "{\"x\":" + String(xVal) + ",\"y\":" + String(yVal) + ",\"z\":" + String(zVal) + ",\"source\":\"live\"}";

    Serial.println("📤 Sending: " + data);
    webSocket.sendTXT(data);
  }
}
