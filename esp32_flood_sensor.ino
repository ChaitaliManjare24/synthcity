/*
  =================================================================================
  PROJECT SYNTHCITY NAGPUR - ESP32 ULTRASONIC FLOOD SENSOR TELEMETRY SKETCH
  =================================================================================
  Hardware Setup:
    - Microcontroller: ESP32 Development Board (NodeMCU ESP-32 / ESP32-WROOM-32)
    - Sensor: HC-SR04 Ultrasonic Distance Sensor
    - Wiring Connections:
        ESP32 GPIO 5 (D5)   --> HC-SR04 TRIG
        ESP32 GPIO 18 (D18) --> HC-SR04 ECHO (via voltage divider or 3.3V compatible sensor)
        ESP32 5V (VIN)      --> HC-SR04 VCC
        ESP32 GND           --> HC-SR04 GND (Common Ground)
  
  Functionality:
    1. Measures distance to water surface clearance in centimeters every 5 seconds.
    2. Transmits real-time telemetry to SynthCity C2 Engine / Firebase RTDB.
    3. Evaluates flood thresholds (Warning < 15cm, Critical Emergency < 5cm).
    4. Triggers automatic multi-agent squad dispatch & WhatsApp/Telegram alert stream.
  =================================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// WiFi Credentials
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// SynthCity Realtime Database / Local C2 Webhook Target
const char* firebaseUrl = "https://my-project-1-602b7-default-rtdb.firebaseio.com/telemetry/esp32_flood.json";
const char* localC2Url  = "http://YOUR_LOCAL_IP:8000/api/iot_telemetry";

// GPIO Pin Definitions for ESP32
const int TRIG_PIN = 5;  // GPIO 5 Output
const int ECHO_PIN = 18; // GPIO 18 Input

// Threshold settings
const float FLOOD_WARNING_CM  = 15.0; // Warning threshold
const float FLOOD_CRITICAL_CM = 5.0;  // Critical emergency flood breach

void setup() {
  Serial.begin(115200);
  delay(100);
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  Serial.println("\n🚀 Starting Project SynthCity ESP32 Ultrasonic Flood Sensor...");

  // Connect to WiFi network
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected! ESP32 IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // 1. Measure Distance via HC-SR04 Ultrasonic Sensor
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  float distanceCm = duration * 0.0343 / 2.0;

  if (duration == 0) {
    Serial.println("⚠️ Sensor pulse timeout - verify HC-SR04 wiring...");
    distanceCm = 150.0; // Default safe baseline if unread
  }

  Serial.print("📡 Water Surface Clearance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");

  // 2. Evaluate Flood Emergency Status
  String statusStr = "NORMAL";
  if (distanceCm < FLOOD_CRITICAL_CM) {
    statusStr = "CRITICAL_FLOOD_ALARM";
    Serial.println("🚨 CRITICAL FLOOD ALARM: Water distance < 5 cm!");
  } else if (distanceCm < FLOOD_WARNING_CM) {
    statusStr = "WARNING";
    Serial.println("🟡 FLOOD WARNING: Water distance < 15 cm!");
  }

  // 3. Transmit Realtime JSON Telemetry Payload to SynthCity C2 Engine
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // prototype testing
    HTTPClient http;

    http.begin(client, firebaseUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{";
    jsonPayload += "\"sensor_id\":\"esp32_nagriver_bridge\",";
    jsonPayload += "\"microcontroller\":\"ESP32\",";
    jsonPayload += "\"location\":\"Nag River Kamptee Bridge (Zone 1)\",";
    jsonPayload += "\"distance_cm\":" + String(distanceCm) + ",";
    jsonPayload += "\"water_level_m\":" + String(3.50 - (distanceCm / 100.0), 2) + ",";
    jsonPayload += "\"status\":\"" + statusStr + "\",";
    jsonPayload += "\"timestamp\":" + String(millis());
    jsonPayload += "}";

    int httpResponseCode = http.PUT(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("✅ Telemetry pushed to Firebase. HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("❌ Error pushing telemetry: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }

  // Poll every 5 seconds
  delay(5000);
}
