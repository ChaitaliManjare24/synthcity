# Project SynthCity Nagpur - Complete Technical Setup Manual & System Architecture

## 1. Executive System Overview
**SynthCity Nagpur** is a multi-agent civic intelligence platform powered by Google Gemini AI models, Firebase Realtime Database, Leaflet geospatial mapping, Open-Meteo weather telemetry, ESP32 IoT ultrasonic sensors, Telegram Bot API, and WhatsApp Business test number alerting.

The platform orchestrates **6 specialized AI agents** operating in a coordinated multi-tier hierarchy to manage municipal infrastructure, flood prediction, vector health risks, citizen issues, and field squad dispatches across Nagpur Metropolitan Region.

---

## 2. 6-AI Agent Architecture Breakdown

| Agent Name | Role | Tier & Scope | Specialized Directives |
| :--- | :--- | :--- | :--- |
| **👑 Synth-Pradhan** | District Orchestrator & Executive Command | Tier 1 (Admin AI Liaison) | Approves emergency squad dispatches, issues executive orders, interfaces with Admin via Web, WhatsApp & Telegram. |
| **💧 Neer-Krishi** | Zone 1 Hydro-Agri Core | Tier 2 (Zone AI 1) | Monitors Nag River water surges, Godhani farmlands, ESP32 flood telemetry, and requests dewatering pumps. |
| **🏙️ Nagari-Tantra** | Zone 2 Urban Infrastructure | Tier 2 (Zone AI 2) | Manages Sitabuldi traffic bottlenecks, central culvert blockages, municipal garbage queues, and road detours. |
| **🏥 Swasthya-Raksha** | Zone 3 Health & Sanitation | Tier 2 (Zone AI 3) | Tracks Hingna MIDC stagnant runoff, dengue vector breeding risks, emergency triage squads, and thermal fogging. |
| **📡 Data-Mitra** | Data Ingestion & Weather Telemetry | Tier 3 (Backup / Internal AI 1) | Ingests Open-Meteo weather API telemetry, Google News RSS, PDF/URL knowledge documents, and ESP32 IoT logs. |
| **🔄 Marg-Darshak** | Route & Logistics Optimizer | Tier 3 (Backup / Internal AI 2) | Calculates traffic bypass routes (e.g. Outer Ring Road), pump transfer logistics, and field squad dispatch ETAs. |

---

## 3. External API Keys & Configuration Registry

### 3.1 Gemini API Key Rotator Array
```json
[
  "YOUR_GEMINI_API_KEY_1",
  "YOUR_GEMINI_API_KEY_2"
]
```

### 3.2 Firebase Realtime Database URL
- **Database Endpoint**: `https://my-project-1-602b7-default-rtdb.firebaseio.com`
- **Auth Domain**: `my-project-1-602b7.firebaseapp.com`
- **Rules File**: `database.rules.json`

### 3.3 Weather Telemetry API (Open-Meteo REST API)
- **Nagpur Coordinates**: Latitude `21.1458`, Longitude `79.0882`
- **Endpoint**: `https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current_weather=true&hourly=precipitation_probability,rain`

### 3.4 Telegram Bot API Configuration
- **Default Bot Token**: `7892019481:AAHkQx9281-Zkx82194812` (Configurable via UI)
- **Chat ID**: `@SynthCityNagpurAlerts`

### 3.5 WhatsApp Test Number API Configuration
- **Admin Registered Test Number**: `+91 98230 44120`
- **API Provider**: WhatsApp Business API / Twilio Sandbox
- **Sandbox Join Code**: `join synthcity-nagpur`

---

### 4. ESP32 IoT Ultrasonic Flood Sensor Integration Guide

### 4.1 Hardware Components
1. **ESP32 Microcontroller Module** (WiFi + Bluetooth Dual-Core IoT Board)
2. **HC-SR04 Ultrasonic Distance Sensor**
3. **Micro-USB Cable & 5V/3.3V Power Source**
4. **Jumper Wires & Breadboard**

### 4.2 Circuit Wiring Pinout
- `ESP32 GPIO 5 (D5)` $\longrightarrow$ `HC-SR04 TRIG`
- `ESP32 GPIO 18 (D18)` $\longrightarrow$ `HC-SR04 ECHO`
- `ESP32 VIN (5V) / 3.3V` $\longrightarrow$ `HC-SR04 VCC`
- `ESP32 GND` $\longrightarrow$ `HC-SR04 GND (Common Ground)`

### 4.3 Arduino IDE Compiler & Upload Setup
1. Download **Arduino IDE** from [arduino.cc](https://www.arduino.cc).
2. Go to `File -> Preferences -> Additional Board Manager URLs` and add:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Go to `Tools -> Board -> Boards Manager`, search for `esp32` and click **Install**.
4. Select board `ESP32 Dev Module`.
5. Connect ESP32 via USB Cable, select correct COM Port, set Baud Rate `115200`.
6. Open `esp32_flood_sensor.ino` and hit Upload.

### 4.4 Arduino C++ Code (`esp32_flood_sensor.ino`)
The full compiled C++ sketch is available in `esp32_flood_sensor.ino`. It measures distance every 5 seconds and posts JSON payloads to Firebase:
```json
{
  "sensor_id": "esp32_nagriver_bridge",
  "microcontroller": "ESP32",
  "location": "Nag River Kamptee Bridge (Zone 1)",
  "distance_cm": 12.4,
  "water_level_m": 3.38,
  "flood_alert": true,
  "status": "CRITICAL_FLOOD_ALARM",
  "timestamp": 1726543000
}
```

---

## 5. Citizen & Admin Telemetry Workflow

```
[Common Citizen / Worker] ──> Telegram Bot (@SynthCityBot)
                                      │
                                      ▼
                             [Data-Mitra / Synth-Pradhan AI]
                                (Location Geocoding & Risk Rating)
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
          [Low / Medium Priority]             [Emergency Flood / Hazard]
                    │                                   │
                    ▼                                   ▼
         Saved to Firebase RTDB              1. Saved to Firebase RTDB
       (Civic Problems Queue)                2. Plotted Red Dot on Map
                    │                        3. Instant WhatsApp to Admin
                    │                        4. Inter-Agent Alert Dialogue
                    ▼                                   │
          [Admin Web Portal] ◄──────────────────────────┘
           - Approve & Dispatch
           - Reject Issue
           - Ask AI to Research
```

---

## 6. System Troubleshooting FAQ & Maintenance

### Q1: Why is the System Documentation Modal not scrolling?
**A**: Ensure `#docs-modal` container uses `max-h-[90vh] flex flex-col` and `#docs-preview-content` is wrapped in `overflow-y-auto min-h-0` with `whitespace-pre-wrap break-words` so long markdown content wraps and scrolls cleanly.

### Q2: How do I test the WhatsApp Emergency Alert without real Twilio credentials?
**A**: Click `📱 WhatsApp Alerts` in top header bar, enter your test phone number, and click `Send Alert`. The system executes simulated HTTP delivery, logs to console, displays a popup payload summary, and persists alert history in Firebase RTDB (`/alerts/whatsapp`).

### Q3: How do I simulate an ultrasonic flood emergency on the map?
**A**: Click `⚡ TRIGGER SIMULATION` on the top dashboard bar. The simulated ESP32 distance updates, water level height spikes, a pulsating red emergency marker appears on the Nag River Kamptee Bridge map location, `Neer-Krishi` and `Synth-Pradhan` initiate an emergency chat order, and a WhatsApp alert is sent to Admin.

---

## 7. Downloadable Project Resources Summary
- `setup_manual.md`: This comprehensive Markdown documentation file.
- `setup_manual.html`: Standalone single-page web documentation hub.
- `esp32_flood_sensor.ino`: Arduino C++ code sketch for ESP32 ultrasonic sensor.
- `PROJECT_DOCUMENTATION.md`: System design specs (10 KB).
- `firebase_schema.json`: Firebase RTDB schema rules and default data tree.
