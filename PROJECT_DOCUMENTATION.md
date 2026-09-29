# PROJECT SYNTHCITY NAGPUR - COMPLETE MULTI-AGENT CIVIC INTELLIGENCE PLATFORM MANUAL

## 1. Executive Summary & Architectural Overview
**Project SynthCity Nagpur** is an autonomous, multi-agent civic intelligence and crisis response platform designed specifically for the Nagpur Metropolitan Region. The system bridges hardware telemetry (ESP32 IoT ultrasonic flood sensors), citizen reporting channels (Telegram Bot API & Web Portal), multi-channel emergency alerting (WhatsApp Business API / Twilio), live open-data APIs (Open-Meteo Weather REST API & Google News RSS feeds), and real-time cloud sync (Firebase Realtime Database).

The platform orchestrates **6 specialized AI agents** operating in a coordinated 3-tier hierarchy to manage flood risks, vector health hazards, urban traffic bottlenecks, municipal field squad dispatches, and executive command.

---

## 2. 6-AI Agent Multi-Tier Architecture & System Routing Matrix

```
                          ┌─────────────────────────────────────────┐
                          │   👑 Synth-Pradhan (Admin AI Liaison)   │
                          │     District Orchestrator & Command      │
                          └────────────────────┬────────────────────┘
                                               │
             ┌─────────────────────────────────┼─────────────────────────────────┐
             ▼                                 ▼                                 ▼
   ┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
   │  💧 Neer-Krishi   │             │ 🏙️ Nagari-Tantra  │             │ 🏥 Swasthya-Raksha│
   │  Zone 1 Hydro-Agri│             │ Zone 2 Urban Infra│             │ Zone 3 Health-Sani│
   └─────────┬─────────┘             └─────────┬─────────┘             └─────────┬─────────┘
             │                                 │                                 │
             └─────────────────────────────────┼─────────────────────────────────┘
                                               │
                                ┌──────────────┴──────────────┐
                                ▼                             ▼
                      ┌───────────────────┐         ┌───────────────────┐
                      │  📡 Data-Mitra    │         │ 🔄 Marg-Darshak   │
                      │  Backup AI 1      │         │ Backup AI 2       │
                      │  Ingestion & Weather│       │ Route & Logistics │
                      └───────────────────┘         └───────────────────┘
```

### Complete AI Agent Directory & Directives Matrix

| Agent Symbol & Name | Role & Specialization | Hierarchy Tier | Domain & Geofence Scope | Core Capabilities & Directives |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Synth-Pradhan** | District Orchestrator & Executive Command | Tier 1 (Admin Liaison) | Metropolitan Nagpur District | Approves municipal squad dispatches, issues executive orders, interfaces with Admin via Web & WhatsApp, escalates emergency alerts. |
| **💧 Neer-Krishi** | Zone 1 Hydro-Agri Core | Tier 2 (Zone AI 1) | Kamptee Road, Nag River North Basin, Godhani Farmlands | Monitors Nag River water surge, ESP32 ultrasonic sensor clearance, coordinates emergency dewatering pump transfers. |
| **🏙️ Nagari-Tantra** | Zone 2 Urban Infrastructure | Tier 2 (Zone AI 2) | Sitabuldi Commercial Hub, Dharampeth, Wardha Road | Manages market traffic gridlocks, stormwater culvert clearance, municipal garbage queues, and detour routing. |
| **🏥 Swasthya-Raksha** | Zone 3 Health & Sanitation | Tier 2 (Zone AI 3) | Hingna MIDC Industrial Area, Ambazari Overflow Runoff | Monitors stagnant industrial runoff, predicts dengue vector breeding risks, coordinates mobile fogging units & triage. |
| **📡 Data-Mitra** | Data Ingestion & Telemetry | Tier 3 (Backup / Internal AI 1) | System-Wide Knowledge Memory | Ingests Open-Meteo weather forecasts, Google News RSS feeds, website URLs, uploaded files, and ESP32 IoT telemetry logs. |
| **🔄 Marg-Darshak** | Route & Logistics Optimizer | Tier 3 (Backup / Internal AI 2) | Metropolitan Logistics Network | Calculates bypass routes (e.g. Outer Ring Road), pump transfer ETAs, vehicle navigation, and field squad dispatch logistics. |

---

## 3. Active External APIs, Keys & Cloud Database Endpoints

### 3.1 Google Gemini AI Model Fallback Chain
- Primary Engine: `synthcity_engine.py` (Direct REST Mode with local SDK fallback)
- Model Hierarchy:
  1. `gemini-3.5-flash-lite` (Default fast execution)
  2. `gemini-3.5-flash`
  3. `gemini-3.6-flash`
  4. `gemini-3.8-flash`
  5. `gemini-flash-lite-latest`

- Pre-Configured API Key Rotator Array:
  - Key #1: `YOUR_GEMINI_API_KEY_1`
  - Key #2: `YOUR_GEMINI_API_KEY_2`

### 3.2 Firebase Realtime Database
- **Database URL**: `https://my-project-1-602b7-default-rtdb.firebaseio.com`
- **Auth Domain**: `my-project-1-602b7.firebaseapp.com`
- **Storage Bucket**: `my-project-1-602b7.firebasestorage.app`
- **Database Paths**:
  - `/chat` : Real-time inter-agent and Admin dialogue messages.
  - `/civic_problems` : Citizen Telegram reports and issue resolution queue.
  - `/field_dispatches` : Active municipal squad and vehicle dispatch records.
  - `/telemetry/esp32_flood` : ESP32 IoT ultrasonic water level telemetry.
  - `/alerts/whatsapp` : Dispatched WhatsApp emergency alert logs.

### 3.3 Open-Meteo Weather API (Nagpur Geolocation)
- **Target Coordinates**: Latitude `21.1458`, Longitude `79.0882`
- **REST API Endpoint**:
  `https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current_weather=true&hourly=precipitation_probability,rain`
- **Telemetry Ingested**: Temperature (°C), Rain Probability (%), Precipitation (mm), Wind Speed (km/h).

### 3.4 Telegram Bot Integration
- **Default Bot Username**: `@SynthCityNagpurBot`
- **Bot Token**: `7892019481:AAHkQx9281-Zkx82194812` (Configurable via UI)
- **Functions**: Accepts citizen text reports, geocodes landmark names, plots map dots, and auto-escalates to Admin.

### 3.5 WhatsApp Business API / Twilio Alert Integration
- **Admin Registered Test Phone**: `+91 98230 44120`
- **Twilio Account SID**: `AC_TWILIO_SANDBOX_829148`
- **Functions**: Sends real-time SMS / WhatsApp emergency alerts to Admin on critical flood warnings or squad dispatches.

---

## 4. Hardware Setup Guide: ESP32 Ultrasonic Flood Sensor

### 4.1 Component List
1. **ESP32 Microcontroller Module** (WiFi + Bluetooth IoT Board)
2. **HC-SR04 Ultrasonic Distance Sensor**
3. **Micro-USB Cable & Power Source**
4. **Breadboard & Jumper Wires**

### 4.2 Pin Wiring Schematic
```
    ┌───────────────────────┐                  ┌───────────────────────┐
    │     ESP32 Dev Board   │                  │  HC-SR04 ULTRASONIC   │
    │                       │                  │                       │
    │  GPIO 5 (D5) ─────────┼──────────────────┼──> TRIG               │
    │  GPIO 18 (D18) ───────┼──────────────────┼──> ECHO               │
    │  VIN (5V) / 3.3V  ────┼──────────────────┼──> VCC                │
    │  GND  ────────────────┼──────────────────┼──> GND (Common)       │
    └───────────────────────┘                  └───────────────────────┘
```

### 4.3 Arduino C++ Compilation & Upload Instructions (`esp32_flood_sensor.ino`)
1. Open **Arduino IDE** (v2.0 or higher).
2. Go to **Preferences** $\rightarrow$ Additional Board Manager URLs, add: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`.
3. Go to **Tools** $\rightarrow$ Board $\rightarrow$ Board Manager, search for `esp32` and click **Install**.
4. Select Board: `ESP32 Dev Module`.
5. Open `esp32_flood_sensor.ino` from workspace.
6. Replace `YOUR_WIFI_SSID` and `YOUR_WIFI_PASSWORD` with your local credentials.
7. Click **Upload**. Sensor will poll distance every 5s and POST payloads to Firebase RTDB & C2 backend.

---

## 5. Nagpur Landmark Geocoding & Field Squad Registry

### 5.1 Landmark Geocoding Coordinates Dictionary
- **GH Raisoni College (Hingna Road)**: `[21.1020, 79.0050]`
- **VNIT Nagpur Campus**: `[21.1230, 79.0510]`
- **Mihan SEZ Hub**: `[21.0500, 79.0300]`
- **Futala Lake Promenade**: `[21.1540, 79.0430]`
- **Ambazari Lake & Spillway**: `[21.1290, 79.0480]`
- **Empress City Mall**: `[21.1470, 79.0920]`
- **Sitabuldi Main Market**: `[21.1470, 79.0820]`
- **Nag River Kamptee Bridge**: `[21.2200, 79.1100]`
- **Hingna MIDC Sector 12**: `[21.1100, 78.9800]`

### 5.2 Active Municipal Field Squads Registry

| Squad Name | Assigned Lead Inspector | Contact Phone | Vehicle Reg Number | Equipment & Gear |
| :--- | :--- | :--- | :--- | :--- |
| **NMC Sanitation Squad #4** | Inspector Rajesh Sharma | `+91 98230 44120` | `MH-31-EQ-4892` | Heavy Compactor Garbage Truck & Waste Suction Gear |
| **NMC Dewatering Unit #1** | Officer Suresh Deshmukh | `+91 94221 88301` | `MH-31-CT-1092` | High-Capacity Dewatering Truck & 250 HP Portable Pumps |
| **Mobile Fogging Unit #2** | Dr. Ananya Joshi | `+91 97654 11209` | `MH-31-FR-5510` | Thermal Fogging Cannons & Larvicide Sprayers |
| **NMC Traffic & Culvert Detour** | Sub-Inspector Vikrant Patil | `+91 98812 33904` | `MH-31-DV-7741` | Traffic Diverters & Culvert Unblocking Tools |

---

## 6. Complete File Directory & Component Manifest

| Component Group | Filename | Exact Role & Description |
| :--- | :--- | :--- |
| **Dashboard** | [`index.html`](file:///c:/Users/lokha/Downloads/Synth%20City/index.html) | Interactive Glassmorphism command & control dashboard for metropolitan operations. |
| **Styling** | [`styles.css`](file:///c:/Users/lokha/Downloads/Synth%20City/styles.css) | Cyber-glass visual theme, dark mode, responsive cards, WhatsApp console UI, and tooltips. |
| **Client Engine** | [`app.js`](file:///c:/Users/lokha/Downloads/Synth%20City/app.js) | Leaflet map renderer, Chart.js telemetry, speech recognition, and simulation triggers. |
| **Config** | [`config.js`](file:///c:/Users/lokha/Downloads/Synth%20City/config.js) | Contiguous zero-gap zone polygons, Esri World Street default tile layer, and geocoding. |
| **AI Engine** | [`synthcity_engine.py`](file:///c:/Users/lokha/Downloads/Synth%20City/synthcity_engine.py) | Python multi-agent engine with Gemini key rotator, model failover chain, and Firebase sync. |
| **C2 Server** | [`backend.py`](file:///c:/Users/lokha/Downloads/Synth%20City/backend.py) | Local REST API server for civic dataset ingestion, field dispatches, and AI agent routing. |
| **Telegram Bot** | [`bot_engine.py`](file:///c:/Users/lokha/Downloads/Synth%20City/bot_engine.py) | Telegram bot daemon with rate-limiting, citizen complaint intake, and emergency alerts. |
| **IoT Firmware** | [`esp32_flood_sensor.ino`](file:///c:/Users/lokha/Downloads/Synth%20City/esp32_flood_sensor.ino) | Arduino C++ firmware for ESP32 + HC-SR04 ultrasonic sensor with HTTP telemetry push. |
| **Datasets** | [`ambulance_data.csv`](file:///c:/Users/lokha/Downloads/Synth%20City/ambulance_data.csv) | Nagpur Emergency 102 ambulance fleet registry and dispatch contacts. |
| **Datasets** | [`rainfall_data.csv`](file:///c:/Users/lokha/Downloads/Synth%20City/rainfall_data.csv) | Vidarbha & Nagpur monsoon historical rainfall statistics across districts. |
| **Datasets** | [`town_amenities.csv`](file:///c:/Users/lokha/Downloads/Synth%20City/town_amenities.csv) | Nagpur District Census Handbook urban civic amenities dataset. |
| **Datasets** | [`village_amenities.csv`](file:///c:/Users/lokha/Downloads/Synth%20City/village_amenities.csv) | Nagpur District Census Handbook rural village infrastructure dataset. |
| **Datasets** | [`health_data.xls`](file:///c:/Users/lokha/Downloads/Synth%20City/health_data.xls) | NFHS-5 factsheets on district public health, sanitation, and water access. |
| **Prompts** | [`master_prompt.txt`](file:///c:/Users/lokha/Downloads/Synth%20City/master_prompt.txt) | Detailed system prompts for all 6 AI personas (C2 Admin, Zone 1-3, Health, Logistics). |
| **Prompts** | [`system_prompts.txt`](file:///c:/Users/lokha/Downloads/Synth%20City/system_prompts.txt) | Condensed prompt reference for rapid local prototyping and evaluation. |
| **Concept** | [`project_concept.txt`](file:///c:/Users/lokha/Downloads/Synth%20City/project_concept.txt) | Original project ideation notes, agent debate mechanics, and civic vision. |
| **Launcher** | [`START_SYSTEM.bat`](file:///c:/Users/lokha/Downloads/Synth%20City/START_SYSTEM.bat) | 1-click Windows batch launcher for backend server, Telegram daemon, and web UI. |

---

## 7. Verification Commands & Operational Checklist
1. **JavaScript Syntax Check**:
   `node -c app.js config.js`
2. **Python Engine Test**:
   `python -m py_compile backend.py synthcity_engine.py bot_engine.py`
3. **Resource Files Verification**:
   `powershell -Command "Get-Item setup_manual.html, setup_manual.md, esp32_flood_sensor.ino, PROJECT_DOCUMENTATION.md | Select-Object Name, Length"`

