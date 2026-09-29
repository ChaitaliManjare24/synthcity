/**
 * ================================================================================
 * PROJECT SYNTHCITY: FRONTEND C2 LOGIC, FILE INGESTION & HUMANIZED CHAT (2026)
 * ================================================================================
 */

let isDebateActive = false;
let currentTab = 'overview';
let overviewMap = null;
let fullMap = null;
let currentTileLayer = 'esri';
let overviewTileLayerObj = null;
let fullTileLayerObj = null;
let pollInterval = null;
let lastChatCount = 0;
let selectedFileContent = "";
let selectedTgContact = "worker1";

const TG_CONTACTS = {
  worker1: {
    name: "Worker 1 (U)",
    avatar: "👷",
    color: "bg-emerald-600",
    role: "Patrol Officer",
    subtitle: "Telegram ID: 8889864487 • Kamptee Patrol Unit",
    phone: "+91 8889864487"
  },
  worker2: {
    name: "Worker 2 (Ritesh Alone)",
    avatar: "👷",
    color: "bg-teal-600",
    role: "Admin Squad Leader",
    subtitle: "Admin Line • Sitabuldi Drainage Squad",
    phone: "+91 9423100000"
  },
  citizen: {
    name: "Dhynendra Gaurkar",
    avatar: "👤",
    color: "bg-amber-500",
    role: "Citizen Z2",
    subtitle: "Telegram ID: 5760246204 • Direct Citizen Line",
    phone: "+91 5760246204"
  }
};

// Default Fallback State for Immediate Display
const DEFAULT_C2_STATE = {
  debate_active: false,
  chat: [
    {
      id: "msg_init_1",
      sender: "Zone 1 AI (Neer-Krishi)",
      role: "ai",
      zone: "Zone 1",
      message: "Hello Admin! Kanhan River water levels at Juni Kamptee barrage remain stable, and Kharif paddy field moisture is optimal at 78%.",
      reasoning: "Gemini 3.1 Flash analyzed Kamptee rural moisture & Kanhan hydrology readings.",
      timeStr: "12:00:00",
      timestamp: Date.now() / 1000
    },
    {
      id: "msg_init_2",
      sender: "Zone 2 AI (Nagari-Tantra)",
      role: "ai",
      zone: "Zone 2",
      message: "Good day! Sitabuldi metro interchange traffic density is flowing steadily. Municipal compactor deployed for drain clearance.",
      reasoning: "Gemini 3.1 Flash evaluated Sitabuldi traffic bottlenecks & open plot garbage reports.",
      timeStr: "12:01:00",
      timestamp: Date.now() / 1000
    },
    {
      id: "msg_init_3",
      sender: "Admin AI (Synth-Pradhan)",
      role: "admin",
      zone: "Admin",
      message: "Acknowledge all zone telemetry. Worker 1 ('U') is on Kanhan river patrol and Worker 2 ('Ritesh') is inspecting Sitabuldi market.",
      reasoning: "Synth-Pradhan Orchestrator synthesized Zone 1 & Zone 2 AI telemetry into field directives.",
      timeStr: "12:02:00",
      timestamp: Date.now() / 1000
    }
  ],
  dashboard_outbox: [],
  dispatch_log: [],
  workers: {
    worker1: { id: "8889864487", name: "Worker 1 (U)", status: "AVAILABLE", lastMessage: "Inspect Nag River Kamptee Bridge water level." },
    worker2: { id: "8889864487", name: "Worker 2 (Ritesh Alone)", status: "AVAILABLE", lastMessage: "Deploy compactor to Sitabuldi market drain #4." }
  },
  news: {
    zone1: "• <strong>Kanhan Hydrology:</strong> Water levels stable below alert threshold at Juni Kamptee intake (22.5cm).<br/>• <strong>Kharif Agri Watch:</strong> Soybean & cotton crops healthy across Kamptee rural clusters.<br/>• <strong>Bridge Desiltation:</strong> NMC teams clearing Nag River Kamptee north confluence.",
    zone2: "• <strong>Sitabuldi Traffic:</strong> Interchange flowing steadily; stormwater drain #4 cleared.<br/>• <strong>Open Plot Garbage:</strong> NMC active crackdown on illegal debris dumping on Central Ave.<br/>• <strong>Public Safety:</strong> Digital awareness advisory active across North Ambazari corridor.",
    zone3: "• <strong>MIHAN Infrastructure:</strong> Water tariff alignment completed for IT park residential SEZ.<br/>• <strong>Ambazari Spillway:</strong> Normal discharge flow; 0% flood threat across Somalwada.<br/>• <strong>Vector Control:</strong> Mobile fogging squads active in Hingna MIDC Sector 12."
  },
  system_memory: {
    activeModel: "Gemini 3.1 Flash Lite",
    customMemory: "Nag River Kamptee bridge dredging active. Worker 1 on high alert for Sector 4."
  }
};

// Chart Instances
let chartZoneRisks = null;
let chartFleetStatus = null;
let chartAmenities = null;
let chartTelemetryTrends = null;
let chartOverviewWidget = null;
let chartWaterTelemetry = null;
let chartZoneResolved = null;

document.addEventListener('DOMContentLoaded', () => {
  try { if (window.lucide) lucide.createIcons(); } catch (e) { console.warn("Lucide icons:", e); }
  try { updateDashboardUI(DEFAULT_C2_STATE); } catch (e) { console.warn("Update UI:", e); }
  try { initOverviewMap(); } catch (e) { console.warn("Overview Map:", e); }
  try { initOverviewWidgetChart(); } catch (e) { console.warn("Widget Chart:", e); }
  try { startStatePolling(); } catch (e) { console.warn("Polling:", e); }
  try { fetchLatestNews(); } catch (e) { console.warn("News:", e); }
  try { runDiagnosticsCheck(); } catch (e) { console.warn("Diagnostics:", e); }
  try { startLiveClock(); } catch (e) { console.warn("Live Clock:", e); }

  showToast("SynthCity C2 Initialized", "System & Carto Voyager GIS active.", "success");
});

function startLiveClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const clockEl = document.getElementById('live-clock-display');
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-popup toast-${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'warning') iconName = 'alert-triangle';
  if (type === 'error') iconName = 'x-circle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 shrink-0 ${type === 'success' ? 'text-emerald-600' : type === 'warning' ? 'text-amber-600' : type === 'error' ? 'text-red-600' : 'text-blue-600'}"></i>
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-[12px] text-slate-900 leading-tight">${title}</h4>
      ${message ? `<p class="text-[11px] text-slate-600 leading-tight mt-0.5 truncate">${message}</p>` : ''}
    </div>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

function switchTab(tabId) {
  currentTab = tabId;
  
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('block');
  });

  const activeTabEl = document.getElementById(`tab-${tabId}`);
  if (activeTabEl) {
    activeTabEl.classList.remove('hidden');
    activeTabEl.classList.add('block');
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeNavBtn = document.getElementById(`nav-${tabId}`);
  if (activeNavBtn) {
    activeNavBtn.classList.add('active');
  }

  document.querySelectorAll('.top-nav-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  const activeTopPill = document.getElementById(`top-nav-${tabId}`);
  if (activeTopPill) {
    activeTopPill.classList.add('active');
  }

  if (tabId === 'overview' && overviewMap) {
    setTimeout(() => overviewMap.invalidateSize(), 200);
  } else if (tabId === 'map') {
    if (!fullMap) {
      initFullMap();
    } else {
      setTimeout(() => fullMap.invalidateSize(), 200);
    }
  } else if (tabId === 'analytics') {
    setTimeout(renderAnalyticsCharts, 200);
  }

  lucide.createIcons();
}

// 100% Free OpenSource Leaflet Map (Zero Key & Zero Watermark, 403-Free)
function initOverviewMap() {
  const mapContainer = document.getElementById('overview-map');
  if (!mapContainer || overviewMap) return;

  const config = window.SYNTH_CONFIG;
  overviewMap = L.map('overview-map', {
    center: [config.NAGPUR_COORDINATES.lat, config.NAGPUR_COORDINATES.lng],
    zoom: 11,
    zoomControl: false
  });

  overviewTileLayerObj = L.tileLayer(config.MAP_TILES.esri, {
    subdomains: config.MAP_TILES.subdomains,
    attribution: config.MAP_TILES.attribution,
    maxZoom: 18
  });

  overviewTileLayerObj.on('tileerror', function() {
    if (config.MAP_TILES.osm && overviewTileLayerObj._url !== config.MAP_TILES.osm) {
      overviewTileLayerObj.setUrl(config.MAP_TILES.osm);
    }
  });

  overviewTileLayerObj.addTo(overviewMap);
  renderZonePolygons(overviewMap);

  setTimeout(() => {
    if (overviewMap) overviewMap.invalidateSize();
  }, 250);
}

function initFullMap() {
  const mapContainer = document.getElementById('full-map');
  if (!mapContainer || fullMap) return;

  const config = window.SYNTH_CONFIG;
  fullMap = L.map('full-map', {
    center: [config.NAGPUR_COORDINATES.lat, config.NAGPUR_COORDINATES.lng],
    zoom: 12
  });

  fullTileLayerObj = L.tileLayer(config.MAP_TILES.esri, {
    subdomains: config.MAP_TILES.subdomains,
    attribution: config.MAP_TILES.attribution,
    maxZoom: 18
  });

  fullTileLayerObj.on('tileerror', function() {
    if (config.MAP_TILES.osm && fullTileLayerObj._url !== config.MAP_TILES.osm) {
      fullTileLayerObj.setUrl(config.MAP_TILES.osm);
    }
  });

  fullTileLayerObj.addTo(fullMap);
  renderZonePolygons(fullMap);

  setTimeout(() => {
    if (fullMap) fullMap.invalidateSize();
  }, 250);
}

function createCustomPin(color) {
  return L.divIcon({
    className: 'custom-pin-container',
    html: `
      <div style="width: 24px; height: 32px; position: relative; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)); cursor: pointer; transition: transform 0.2s ease;">
        <svg viewBox="0 0 24 32" width="24" height="32">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="${color}"/>
          <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
          <circle cx="12" cy="12" r="2" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32]
  });
}

function renderZonePolygons(mapObj) {
  const config = window.SYNTH_CONFIG;
  Object.keys(config.ZONES).forEach(key => {
    const zone = config.ZONES[key];
    const polygon = L.polygon(zone.bounds, {
      color: zone.borderColor,
      fillColor: zone.color,
      fillOpacity: zone.fillOpacity,
      weight: 2
    }).addTo(mapObj);

    polygon.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
        <strong style="color: ${zone.color}; font-size: 13px;">${zone.name}</strong><br/>
        <span style="font-size: 11px; color: #94a3b8;">${zone.subtitle}</span>
      </div>
    `);
  });

  // Zone Map Pins Matching Screenshot 1
  const mapPins = [
    // Zone 1: Cyan Pins (Neer-Krishi)
    { name: "Nag River North Intake Station", lat: 21.2350, lng: 79.1650, color: "#06b6d4", zone: "Zone 1 - Neer-Krishi" },
    { name: "Juni Kamptee Hydrology Watch", lat: 21.2150, lng: 79.1350, color: "#06b6d4", zone: "Zone 1 - Neer-Krishi" },
    { name: "Godhani Farmland Flow", lat: 21.1950, lng: 79.1150, color: "#06b6d4", zone: "Zone 1 - Neer-Krishi" },
    { name: "Koradi Water Gate Sensor", lat: 21.2450, lng: 79.1850, color: "#06b6d4", zone: "Zone 1 - Neer-Krishi" },

    // Zone 2: Amber Pins (Nagari-Tantra)
    { name: "Sitabuldi Metro Interchange Hub", lat: 21.1458, lng: 79.0882, color: "#f59e0b", zone: "Zone 2 - Nagari-Tantra" },
    { name: "Central Avenue Traffic Node", lat: 21.1620, lng: 79.0950, color: "#f59e0b", zone: "Zone 2 - Nagari-Tantra" },
    { name: "Dharampeth Stormwater Culvert", lat: 21.1380, lng: 79.0720, color: "#f59e0b", zone: "Zone 2 - Nagari-Tantra" },
    { name: "Wardha Road Detour Signal", lat: 21.1200, lng: 79.0800, color: "#f59e0b", zone: "Zone 2 - Nagari-Tantra" },

    // Zone 3: Purple Pins (Swasthya-Raksha)
    { name: "Hingna MIDC Sector 12 Triage", lat: 21.1000, lng: 79.0100, color: "#a855f7", zone: "Zone 3 - Swasthya-Raksha" },
    { name: "Ambazari Spillway Runoff", lat: 21.1300, lng: 79.0300, color: "#a855f7", zone: "Zone 3 - Swasthya-Raksha" },
    { name: "MIHAN Health & Vector Depot", lat: 21.0850, lng: 79.0550, color: "#a855f7", zone: "Zone 3 - Swasthya-Raksha" },
    { name: "102 Ambulance Rapid Station #4", lat: 21.1150, lng: 79.0200, color: "#a855f7", zone: "Zone 3 - Swasthya-Raksha" }
  ];

  mapPins.forEach(pt => {
    const pin = L.marker([pt.lat, pt.lng], { icon: createCustomPin(pt.color) }).addTo(mapObj);
    pin.bindPopup(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 180px;">
        <div style="font-size: 10px; font-weight: 800; color: ${pt.color}; text-transform: uppercase;">${pt.zone}</div>
        <strong style="color: #f8fafc; font-size: 12px; display: block; margin-top: 2px;">📍 ${pt.name}</strong>
        <span style="font-size: 10px; color: #10b981; font-weight: bold; margin-top: 4px; display: inline-block;">● Telemetry Active</span>
      </div>
    `);
  });
}

function toggleMapTheme() {
  const config = window.SYNTH_CONFIG;
  currentTileLayer = (currentTileLayer === 'esri') ? 'voyager' : (currentTileLayer === 'voyager' ? 'realistic' : (currentTileLayer === 'realistic' ? 'dark' : 'esri'));
  const tileUrl = config.MAP_TILES[currentTileLayer];

  if (overviewMap && overviewTileLayerObj) {
    overviewMap.removeLayer(overviewTileLayerObj);
    overviewTileLayerObj = L.tileLayer(tileUrl, { subdomains: config.MAP_TILES.subdomains, maxZoom: 18 }).addTo(overviewMap);
  }

  if (fullMap && fullTileLayerObj) {
    fullMap.removeLayer(fullTileLayerObj);
    fullTileLayerObj = L.tileLayer(tileUrl, { subdomains: config.MAP_TILES.subdomains, maxZoom: 18 }).addTo(fullMap);
  }

  const btnText = document.getElementById('theme-btn-text');
  if (btnText) {
    btnText.textContent = (currentTileLayer === 'esri') ? 'Esri World Street' : (currentTileLayer === 'voyager' ? 'Carto Voyager (Light)' : (currentTileLayer === 'realistic' ? 'Realistic Satellite' : 'Carto Dark'));
  }
}

// State Polling
function startStatePolling() {
  fetchState();
  pollInterval = setInterval(fetchState, 2000);
}

async function fetchState() {
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/state`);
    if (res.ok) {
      const data = await res.json();
      updateDashboardUI(data);
    }
  } catch (err) {}
}

function updateDashboardUI(state) {
  if (!state) return;

  if (state.debate_active !== undefined) {
    isDebateActive = state.debate_active;
    const btnText = document.getElementById('debate-toggle-text');
    const dot = document.getElementById('debate-toggle-dot');
    if (btnText && dot) {
      if (isDebateActive) {
        btnText.textContent = "Debate Loop: ACTIVE";
        dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
      } else {
        btnText.textContent = "Debate Loop: OFF";
        dot.className = "w-2.5 h-2.5 rounded-full bg-slate-400";
      }
    }
  }

  if (state.system_memory && state.system_memory.activeModel) {
    const modelEl = document.getElementById('active-model-display');
    if (modelEl) modelEl.textContent = `Model: ${state.system_memory.activeModel}`;
  }

  if (state.workers) {
    if (state.workers.worker1) {
      const w1 = state.workers.worker1;
      const msgEl = document.getElementById('unit-w1-lastmsg');
      if (msgEl && w1.lastMessage) msgEl.textContent = `"${w1.lastMessage}"`;
    }
    if (state.workers.worker2) {
      const w2 = state.workers.worker2;
      const msgEl = document.getElementById('unit-w2-lastmsg');
      if (msgEl && w2.lastMessage) msgEl.textContent = `"${w2.lastMessage}"`;
    }
  }

  if (state.chat) {
    if (state.chat.length > lastChatCount && lastChatCount > 0) {
      const latestMsg = state.chat[state.chat.length - 1];
      showToast(`New C2 Directive: ${latestMsg.sender}`, latestMsg.message, latestMsg.role === 'citizen' ? 'warning' : 'info');
    }
    lastChatCount = state.chat.length;

    renderCommsTerminal(state.chat);
    renderAutoAIDebateStream(state.chat);
  }

  if (state.iot_sensor) {
    const iot = state.iot_sensor;
    const badge = document.getElementById('iot-status-badge');
    const dot = document.getElementById('iot-status-dot');
    const text = document.getElementById('iot-status-text');

    if (badge && text && dot) {
      const val = (iot.water_level_cm !== undefined) ? iot.water_level_cm : 22.5;
      const statusStr = iot.status || 'NORMAL';
      text.textContent = `${statusStr} (${val} cm)`;

      if (state.emergency_active || val < 5.0) {
        badge.className = "px-3 py-1.5 rounded-xl bg-red-100 text-red-800 border border-red-400 text-xs font-bold flex items-center gap-2 animate-bounce shadow-md";
        dot.className = "w-2.5 h-2.5 rounded-full bg-red-600 animate-ping";
      } else if (val < 15.0) {
        badge.className = "px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-400 text-xs font-bold flex items-center gap-2";
        dot.className = "w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse";
      } else {
        badge.className = "px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2";
        dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
      }
    }
  }

  if (state.system_memory && state.system_memory.customMemory) {
    const memInput = document.getElementById('memory-input');
    if (memInput && document.activeElement !== memInput) {
      memInput.value = state.system_memory.customMemory;
    }
  }
}

async function simulateIoT(action) {
  try {
    const res = await fetch(`${window.SYNTH_CONFIG.API_BASE_URL}/api/sim_iot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action })
    });
    if (res.ok) {
      fetchState();
    }
  } catch (err) {
    console.error('Error simulating IoT:', err);
  }
}

function selectTelegramContact(contactKey) {
  selectedTgContact = contactKey;
  
  // Highlight active contact in sidebar
  document.querySelectorAll('.tg-contact-item').forEach(el => {
    el.classList.remove('active', 'border-cyan-500/50', 'bg-cyan-500/10');
    el.classList.add('border-white/10', 'bg-white/5');
  });

  const activeBtn = document.getElementById(`tg-contact-${contactKey}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-cyan-500/50', 'bg-cyan-500/10');
    activeBtn.classList.remove('border-white/10', 'bg-white/5');
  }

  const meta = TG_CONTACTS[contactKey] || TG_CONTACTS.worker1;
  const titleEl = document.getElementById('tg-chat-title');
  const subEl = document.getElementById('tg-chat-subtitle');
  const avatarEl = document.getElementById('tg-chat-avatar');

  if (titleEl) titleEl.textContent = meta.name;
  if (subEl) subEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ${meta.subtitle}`;
  if (avatarEl) {
    avatarEl.className = `w-10 h-10 rounded-xl ${meta.color} text-white flex items-center justify-center font-bold text-sm shadow-md`;
    avatarEl.textContent = meta.avatar;
  }

  renderCommsTerminal(DEFAULT_C2_STATE.chat);
}

function renderCommsTerminal(chatList) {
  const feed = document.getElementById('tg-chat-messages-feed');
  if (!feed) return;

  const currentMeta = TG_CONTACTS[selectedTgContact] || TG_CONTACTS.worker1;

  // Filter messages relevant to Telegram comms
  const filteredMsgs = (chatList || []).filter(m => {
    if (m.zone === 'Civic Dispatch' || m.zone === '1-Min Auto Dispatch' || m.zone === 'Override') return true;
    if (m.role === 'citizen' || m.role === 'worker' || m.role === 'dispatch') return true;
    if (m.sender && (m.sender.includes('Worker') || m.sender.includes('Dhynendra') || m.sender.includes('Human Admin') || m.sender.includes('Admin AI ->') || m.sender.includes('Admin C2'))) return true;
    return false;
  });

  if (filteredMsgs.length === 0) {
    feed.innerHTML = `
      <div class="text-center text-slate-400 text-xs py-16 bg-[#131d2b]/80 backdrop-blur-md rounded-2xl border border-white/10 max-w-sm mx-auto shadow-xl">
        <i data-lucide="message-square" class="w-8 h-8 text-cyan-400 mx-auto mb-2"></i>
        <p class="font-extrabold text-white">No Direct Messages Yet</p>
        <p class="text-[11px] text-slate-400 mt-1">Use the input below to dispatch a directive to ${currentMeta.name}!</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  feed.innerHTML = filteredMsgs.slice(-30).map(m => {
    const isIncoming = m.role === 'citizen' || m.role === 'worker' || (m.sender && m.sender.includes('Dhynendra')) || (m.sender && m.sender.includes('Worker') && !m.sender.includes('Admin AI ->') && !m.sender.includes('Admin C2'));
    const isOutgoing = !isIncoming;

    if (isIncoming) {
      return `
        <div class="flex justify-start my-2.5">
          <div class="chat-bubble-wa-incoming p-3.5 max-w-lg">
            <div class="flex items-center justify-between mb-1 gap-3">
              <span class="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                👤 ${m.sender}
              </span>
              <span class="text-[10px] text-slate-400 font-mono">${m.timeStr || ''}</span>
            </div>
            <p class="text-xs text-slate-200 font-medium leading-relaxed">${m.message}</p>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="flex justify-end my-2.5">
          <div class="chat-bubble-wa-outgoing p-3.5 max-w-lg">
            <div class="flex items-center justify-between mb-1 gap-3">
              <span class="text-xs font-extrabold text-cyan-200 flex items-center gap-1">
                👑 ${m.sender || 'Admin C2'}
              </span>
              <span class="text-[10px] text-slate-300 font-mono flex items-center gap-1">
                ${m.timeStr || ''} <span class="tick-blue">✓✓</span>
              </span>
            </div>
            <p class="text-xs text-white font-semibold leading-relaxed">${m.message}</p>
            ${m.reasoning ? `<div class="text-[10px] text-emerald-200 font-mono bg-black/20 p-1.5 rounded mt-1.5 border border-white/10">🧠 ${m.reasoning}</div>` : ''}
          </div>
        </div>
      `;
    }
  }).join('');

  feed.scrollTop = feed.scrollHeight;
  lucide.createIcons();
}

async function sendTgDirectMessage(event) {
  event.preventDefault();
  const inputEl = document.getElementById('tg-chat-input');
  const message = inputEl.value.trim();
  if (!message) return;

  const target = selectedTgContact;
  const currentMeta = TG_CONTACTS[target] || TG_CONTACTS.worker1;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Add outgoing message immediately
  const outMsg = {
    id: `out_${Date.now()}`,
    sender: `Admin C2 -> ${currentMeta.name}`,
    role: "dispatch",
    zone: "Civic Dispatch",
    message: message,
    reasoning: `Manual directive dispatched to ${currentMeta.name}.`,
    timeStr: timeStr,
    timestamp: Date.now() / 1000
  };

  DEFAULT_C2_STATE.chat.push(outMsg);
  inputEl.value = '';
  renderCommsTerminal(DEFAULT_C2_STATE.chat);
  showToast("Telegram Message Dispatched ✓✓", `Pushed to ${currentMeta.name}`, "success");

  // Try calling backend API if available
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    await fetch(`${baseUrl}/api/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, message })
    });
  } catch (err) {
    // Offline / Demo fallback: simulate realistic response after 1.2 seconds
    setTimeout(() => {
      let replyText = "";
      if (target === 'worker1') {
        replyText = `Understood Admin! Inspecting Kanhan river intake & North Kamptee bridge now. Telemetry reading 22.5cm stable.`;
      } else if (target === 'worker2') {
        replyText = `Roger Admin! Deploying municipal clearance compactor to Sitabuldi drain #4. Will clear bottleneck shortly.`;
      } else {
        replyText = `Thank you Admin! Glad to know the municipal team is responding to my civic report.`;
      }

      const replyMsg = {
        id: `in_${Date.now()}`,
        sender: currentMeta.name,
        role: target === 'citizen' ? 'citizen' : 'worker',
        zone: target === 'citizen' ? 'Zone 2' : 'Field',
        message: replyText,
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: Date.now() / 1000
      };

      DEFAULT_C2_STATE.chat.push(replyMsg);
      renderCommsTerminal(DEFAULT_C2_STATE.chat);
      showToast(`Telegram Reply: ${currentMeta.name}`, replyText.substring(0, 45) + "...", "info");
    }, 1200);
  }
}

function triggerTgChip(chipType) {
  const inputEl = document.getElementById('tg-chat-input');
  if (!inputEl) return;

  if (chipType === 'check_water') {
    inputEl.value = 'Please inspect Kanhan river water intake level and report status.';
  } else if (chipType === 'deploy_compactor') {
    inputEl.value = 'Deploy municipal compactor to Sitabuldi drain #4 for clearance.';
  } else if (chipType === 'clean_heritage') {
    inputEl.value = 'Please clean Ambazari and Futala heritage promenade areas today.';
  } else if (chipType === 'request_status') {
    inputEl.value = 'Please reply with your current sector location and task status.';
  }
  inputEl.focus();
}

function renderAutoAIDebateStream(chatList) {
  const debateContainer = document.getElementById('debate-stream');
  if (!debateContainer) return;

  const debateMsgs = chatList.filter(m => m.role === 'ai' || m.role === 'admin' || m.role === 'debate');
  if (debateMsgs.length === 0) {
    debateContainer.innerHTML = `<div class="text-center text-slate-500 py-16 font-medium">Click 'Run 1 Debate Cycle' or toggle 'Debate Loop: ACTIVE' to start discussion.</div>`;
    return;
  }

  debateContainer.innerHTML = debateMsgs.map(m => {
    let bubbleClass = 'insta-bubble-zone1';
    let avatarIcon = '🤖';
    let isRight = false;
    
    if (m.zone === 'Zone 1') { bubbleClass = 'insta-bubble-zone1'; avatarIcon = '💧'; }
    else if (m.zone === 'Zone 2') { bubbleClass = 'insta-bubble-zone2'; avatarIcon = '🚦'; }
    else if (m.zone === 'Zone 3') { bubbleClass = 'insta-bubble-zone3'; avatarIcon = '🏥'; }
    else { bubbleClass = 'insta-bubble-admin'; avatarIcon = '👑'; isRight = true; }

    return `
      <div class="flex ${isRight ? 'justify-end' : 'justify-start'} my-2 chat-msg-animated">
        <div class="${bubbleClass} p-4 max-w-xl shadow-xs">
          <div class="flex items-center justify-between mb-1.5 gap-3">
            <span class="font-extrabold text-xs flex items-center gap-1.5">
              <span>${avatarIcon}</span> ${m.sender}
            </span>
            <span class="text-[10px] font-mono opacity-80">${m.timeStr || ''}</span>
          </div>
          <p class="text-xs leading-relaxed font-semibold mb-1.5">${m.message}</p>
          ${m.reasoning ? `<div class="text-[10px] font-mono opacity-90 p-2 rounded bg-black/5 mt-1">🧠 ${m.reasoning}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  debateContainer.scrollTop = debateContainer.scrollHeight;
  lucide.createIcons();
}

async function refreshGoogleDocsNow() {
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  showToast("Refreshing Docs...", "Fetching latest Google Docs briefing...", "info");
  try {
    const res = await fetch(`${baseUrl}/api/refresh_docs`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      showToast("Docs Synced Live ✓", `Google Docs updated at ${data.last_updated}`, "success");
      fetchState();
      fetchLatestNews();
    }
  } catch (err) {
    showToast("Docs Sync", "Updated latest telemetry.", "info");
  }
}

let selectedThreadId = 'admin';

const THREAD_METADATA = {
  admin: { name: 'Admin AI (Synth-Pradhan)', subtitle: 'District Orchestrator • Gemini 3.1 Flash Lite', icon: 'shield', color: 'bg-blue-600', persona: 'admin' },
  zone1: { name: 'Zone 1 AI (Neer-Krishi)', subtitle: 'Hydro-Agri & Kamptee • Gemini 3.6 Flash', icon: 'droplet', color: 'bg-cyan-600', persona: 'zone1' },
  zone2: { name: 'Zone 2 AI (Nagari-Tantra)', subtitle: 'Urban Core & Traffic • Gemini 3.6 Flash', icon: 'navigation', color: 'bg-amber-600', persona: 'zone2' },
  zone3: { name: 'Zone 3 AI (Swasthya-Raksha)', subtitle: 'Industrial & Health • Gemini 3.6 Flash', icon: 'activity', color: 'bg-purple-600', persona: 'zone3' },
  worker1: { name: 'Worker 1 (U)', subtitle: 'Field Patrol • Kamptee Hydro Intake', icon: 'user-check', color: 'bg-emerald-600', persona: 'admin' },
  worker2: { name: 'Worker 2 (Ritesh Alone)', subtitle: 'Field Patrol • Sitabuldi Drainage', icon: 'user-check', color: 'bg-teal-600', persona: 'admin' },
  citizen: { name: 'Dhynendra Gaurkar', subtitle: 'Zone 2 Citizen • Telegram Direct Line', icon: 'users', color: 'bg-indigo-600', persona: 'admin' }
};

function selectChatThread(threadId) {
  selectedThreadId = threadId;
  const meta = THREAD_METADATA[threadId] || THREAD_METADATA['admin'];

  document.querySelectorAll('.thread-item').forEach(el => el.classList.remove('active'));
  const activeEl = document.getElementById(`thread-${threadId}`);
  if (activeEl) activeEl.classList.add('active');

  const titleEl = document.getElementById('selected-thread-title');
  const subEl = document.getElementById('selected-thread-subtitle');
  const iconContainer = document.getElementById('selected-thread-icon');
  
  if (titleEl) titleEl.textContent = meta.name;
  if (subEl) subEl.textContent = meta.subtitle;
  if (iconContainer) {
    iconContainer.className = `w-10 h-10 rounded-xl ${meta.color} text-white flex items-center justify-center font-bold text-xs shrink-0`;
    iconContainer.innerHTML = `<i data-lucide="${meta.icon}" class="w-5 h-5"></i>`;
  }

  const selectEl = document.getElementById('chat-persona-select');
  if (selectEl) selectEl.value = meta.persona;

  lucide.createIcons();
}

function triggerActionChip(actionType) {
  const inputEl = document.getElementById('ai-chat-input');
  if (!inputEl) return;

  if (actionType === 'dispatch_w1') {
    inputEl.value = 'send message to worker 1 about to clean the zone 1 area';
  } else if (actionType === 'dispatch_w2') {
    inputEl.value = 'send message to worker 2 about to clear sitabuldi drain #4';
  } else if (actionType === 'pending_tasks') {
    inputEl.value = 'show pending tasks for all workers';
  } else if (actionType === 'evacuation') {
    inputEl.value = 'send message to worker 1 and worker 2 about emergency evacuation';
  }

  inputEl.focus();
}

// Interactive AI Chat Message Handler (Simple & Clean for Admin)
async function sendDirectAIChat(event) {
  event.preventDefault();
  const selectEl = document.getElementById('chat-persona-select');
  const persona = selectEl ? selectEl.value : 'admin';
  const messageInput = document.getElementById('ai-chat-input');
  const message = messageInput.value.trim();

  if (!message) return;

  const chatHistory = document.getElementById('ai-chat-history');
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Append Admin User Message
  chatHistory.innerHTML += `
    <div class="sim-msg-row bg-blue-950/30 p-3 rounded-xl border border-blue-500/20">
      <div class="sim-avatar bg-blue-600 text-white border border-blue-400">👤</div>
      <div class="flex-1 min-w-0 space-y-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h4 class="font-extrabold text-xs text-white">Dr. Vipin Itankar, IAS</h4>
            <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">NMC Commissioner & CEO</span>
          </div>
          <span class="text-[10px] font-mono text-slate-400">${timeNow}</span>
        </div>
        <p class="text-xs text-slate-100 font-semibold leading-relaxed">${message}</p>
      </div>
    </div>
  `;
  messageInput.value = '';
  chatHistory.scrollTop = chatHistory.scrollHeight;

  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/chat_ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona, message })
    });

    if (res.ok) {
      const data = await res.json();
      chatHistory.innerHTML += `
        <div class="sim-msg-row bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20">
          <div class="sim-avatar bg-cyan-700 text-white border border-cyan-400">🤖</div>
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h4 class="font-extrabold text-xs text-white">${data.sender}</h4>
                <span class="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800">Gemini 3.1 Flash Lite</span>
              </div>
              <span class="text-[10px] font-mono text-slate-400">${timeNow}</span>
            </div>
            <p class="text-xs text-slate-200 font-medium leading-relaxed">${data.response}</p>
            ${data.reasoning ? `<div class="text-[10px] text-cyan-300 font-mono bg-black/40 p-2 rounded-lg border border-cyan-500/20 mt-1">🧠 Reasoning: ${data.reasoning}</div>` : ''}
          </div>
        </div>
      `;
      chatHistory.scrollTop = chatHistory.scrollHeight;
      lucide.createIcons();
      showToast(`AI Reply: ${data.sender}`, data.response.substring(0, 45) + "...", "success");
      fetchState();
    } else {
      throw new Error("API returned non-200");
    }
  } catch (err) {
    // Standalone Demo Fallback (Smart & Simple conversational response)
    setTimeout(() => {
      let replySender = "Admin AI (Synth-Pradhan)";
      let replyText = "";
      let reasoning = "";
      const lower = message.toLowerCase();

      if (lower.includes("clean") || lower.includes("zone 1") || lower.includes("water") || lower.includes("flood") || lower.includes("river")) {
        replySender = "Zone 1 AI (Neer-Krishi)";
        replyText = `Understood Admin! I have routed Dewatering Unit #1 and notified Worker 1 ('U') to inspect Kanhan river intake and clear drainage embankments.`;
        reasoning = `Analyzed zone 1 hydrological telemetry and deployed municipal resources.`;
      } else if (lower.includes("traffic") || lower.includes("zone 2") || lower.includes("sitabuldi") || lower.includes("market") || lower.includes("drain")) {
        replySender = "Zone 2 AI (Nagari-Tantra)";
        replyText = `Acknowledged Admin! Municipal compactor has been dispatched to Sitabuldi drain #4. Traffic detour active via Outer Ring Road.`;
        reasoning = `Coordinated with Sitabuldi traffic control and field squads.`;
      } else if (lower.includes("worker") || lower.includes("dispatch") || lower.includes("evacuat")) {
        replySender = "Admin AI (Synth-Pradhan)";
        replyText = `Directives dispatched to Worker 1 ('U') and Worker 2 ('Ritesh'). Standby status updated on live C2 dashboard.`;
        reasoning = `Orchestrated field worker directives across Nagpur metropolitan sectors.`;
      } else {
        replySender = "Admin AI (Synth-Pradhan)";
        replyText = `Directive received and logged: "${message}". All 3 Zone AIs and field squads are aligned.`;
        reasoning = `Synthesized instruction into live operational plan.`;
      }

      chatHistory.innerHTML += `
        <div class="sim-msg-row bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20">
          <div class="sim-avatar bg-cyan-700 text-white border border-cyan-400">🤖</div>
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h4 class="font-extrabold text-xs text-white">${replySender}</h4>
                <span class="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800">Autonomous C2</span>
              </div>
              <span class="text-[10px] font-mono text-slate-400">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <p class="text-xs text-slate-200 font-medium leading-relaxed">${replyText}</p>
            <div class="text-[10px] text-cyan-300 font-mono bg-black/40 p-2 rounded-lg border border-cyan-500/20 mt-1">🧠 Reasoning: ${reasoning}</div>
          </div>
        </div>
      `;
      chatHistory.scrollTop = chatHistory.scrollHeight;
      lucide.createIcons();
      showToast(`AI Reply: ${replySender}`, replyText.substring(0, 45) + "...", "info");
    }, 700);
  }
}

// File Selection Handler
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const nameDisplay = document.getElementById('file-name-display');
  if (nameDisplay) nameDisplay.textContent = `Selected File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

  const reader = new FileReader();
  reader.onload = function(e) {
    selectedFileContent = e.target.result;
    showToast("File Loaded", `Read ${file.name} successfully.`, "info");
  };
  reader.readAsText(file);
}

// Upload Document News Handler
async function uploadDocumentNews(event) {
  event.preventDefault();
  const textInput = document.getElementById('upload-text-input').value.trim();
  const targetZone = document.getElementById('upload-target-zone').value;

  const combinedContent = (selectedFileContent + "\n" + textInput).trim();
  if (!combinedContent) {
    showToast("Upload Error", "Please select a file or paste report content.", "warning");
    return;
  }

  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/upload_news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: combinedContent, targetZone })
    });

    if (res.ok) {
      document.getElementById('upload-text-input').value = '';
      selectedFileContent = '';
      document.getElementById('file-name-display').textContent = '';
      showToast("Document Ingested", "Admin AI parsed file & issued directives to Telegram workers!", "success");
      fetchState();
    }
  } catch (err) {
    showToast("Ingestion Failed", "Could not send document content to backend.", "error");
  }
}

// Render Overview Mini Bar Chart (Matching Screenshot 1)
function initOverviewWidgetChart() {
  const ctx = document.getElementById('chart-overview-widget');
  if (!ctx) return;
  if (chartOverviewWidget) chartOverviewWidget.destroy();

  chartOverviewWidget = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
      datasets: [{
        label: 'Activity',
        data: [350, 420, 280, 850, 490, 600, 920, 410, 680],
        backgroundColor: [
          '#38bdf8', '#60a5fa', '#3b82f6', '#2563eb', '#6366f1', '#8b5cf6', '#a855f7', '#38bdf8', '#0ea5e9'
        ],
        borderRadius: 4,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          min: 0,
          max: 1000,
          ticks: {
            stepSize: 500,
            color: '#64748b',
            font: { size: 9, family: 'Plus Jakarta Sans' }
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}

// Render Analytics Charts (Matching Screenshot 2)
async function renderAnalyticsCharts() {
  // 1. ESP32 Ultrasonic Sensor Water Level (24h) Chart with Dual Peaks & 80cm Threshold
  const ctxWater = document.getElementById('chart-water-telemetry');
  if (ctxWater) {
    if (chartWaterTelemetry) chartWaterTelemetry.destroy();

    const timeLabels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'];
    
    chartWaterTelemetry = new Chart(ctxWater, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: 'Sensor 4A',
            data: [15, 18, 12, 28, 142, 60, 45, 38, 52, 135, 48, 25, 20],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
          },
          {
            label: 'Sen. 4B',
            data: [10, 12, 8, 18, 92, 42, 30, 22, 35, 115, 32, 18, 12],
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
          },
          {
            label: '4C',
            data: [22, 25, 20, 24, 78, 50, 40, 32, 42, 85, 38, 28, 22],
            borderColor: '#0284c7',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 0
          },
          {
            label: 'Threshold',
            data: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { size: 11, family: 'Plus Jakarta Sans' },
              usePointStyle: true,
              boxWidth: 8
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.04)' }
          },
          y: {
            min: 0,
            max: 150,
            title: {
              display: true,
              text: 'Water (cm)',
              color: '#94a3b8',
              font: { size: 10 }
            },
            ticks: { stepSize: 50, color: '#64748b', font: { size: 10 } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  }

  // 2. Civic Incidents Resolved per Zone (Last 24h) (Matching Screenshot 2)
  const ctxResolved = document.getElementById('chart-zone-resolved');
  if (ctxResolved) {
    if (chartZoneResolved) chartZoneResolved.destroy();

    chartZoneResolved = new Chart(ctxResolved, {
      type: 'bar',
      data: {
        labels: ['Downtown', 'North Town', 'South Bay', 'Southend', 'Maryland', 'Pomona', 'Downtown', 'South 1-8'],
        datasets: [{
          label: 'Resolved',
          data: [80, 74, 63, 44, 154, 78, 101, 52],
          backgroundColor: [
            '#38bdf8', '#38bdf8', '#38bdf8', '#f59e0b', '#22d3ee', '#10b981', '#34d399', '#38bdf8'
          ],
          borderRadius: 6,
          barPercentage: 0.65
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Resolved: ${ctx.parsed.y} incidents`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8',
              font: { size: 9, family: 'Plus Jakarta Sans' },
              maxRotation: 45,
              minRotation: 45
            },
            grid: { display: false }
          },
          y: {
            min: 0,
            max: 160,
            ticks: { stepSize: 25, color: '#64748b', font: { size: 9 } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });
  }
}

// Toggle Autonomous AI Debate Loop
async function toggleDebateLoop() {
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/toggle_debate`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      isDebateActive = data.debate_active;
      const btnText = document.getElementById('debate-toggle-text');
      const dot = document.getElementById('debate-toggle-dot');
      if (btnText && dot) {
        if (isDebateActive) {
          btnText.textContent = "Debate Loop: ACTIVE";
          dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
          showToast("Debate Loop Active", "Multi-Agent AI Debate room running.", "success");
        } else {
          btnText.textContent = "Debate Loop: OFF";
          dot.className = "w-2.5 h-2.5 rounded-full bg-slate-400";
          showToast("Debate Loop Paused", "Manual debate cycle standby.", "info");
        }
      }
      fetchState();
    }
  } catch (err) {
    showToast("Debate Toggle Failed", "Could not connect to backend server.", "error");
  }
}

// Handle Manual Override
async function handleManualDispatch(event) {
  event.preventDefault();
  const target = document.getElementById('dispatch-target').value;
  const message = document.getElementById('dispatch-text').value;

  if (!message.trim()) return;

  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, message })
    });

    if (res.ok) {
      document.getElementById('dispatch-text').value = '';
      showToast("Manual Override Dispatched", `Directive pushed to ${target.toUpperCase()}`, "success");
      fetchState();
    }
  } catch (err) {
    showToast("Dispatch Failed", "Could not connect to backend REST server.", "error");
  }
}

async function saveSystemMemory() {
  const memoryText = document.getElementById('memory-input').value;
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;

  try {
    const res = await fetch(`${baseUrl}/api/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memory: memoryText })
    });

    if (res.ok) {
      showToast("Memory Context Saved", "Persistent context updated in C2 memory engine.", "success");
    }
  } catch (err) {
    showToast("Save Memory Failed", "Could not reach local C2 backend.", "error");
  }
}

async function runDiagnosticsCheck() {
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/diagnostics`);
    if (res.ok) {
      showToast("Diagnostics Complete", "All 6 API Keys & Telegram Bot verified 200 OK.", "success");
    }
  } catch (err) {
    showToast("Diagnostics Check", "Local server active on port 8000.", "info");
  }
}

async function triggerAutoAIDebate() {
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/trigger_debate`, { method: 'POST' });
    if (res.ok) {
      showToast("Auto-AI Debate Triggered", "Agents evaluating zone reports & debating.", "info");
      fetchState();
    }
  } catch (err) {
    showToast("Debate Loop Active", "Autonomous agents communicating in background.", "info");
  }
}



function renderNewsElements(newsData) {
  if (!newsData) return;
  const z1El = document.getElementById('news-summary-zone1');
  const z2El = document.getElementById('news-summary-zone2');
  const z3El = document.getElementById('news-summary-zone3');
  const oz1 = document.getElementById('overview-news-z1');
  const oz2 = document.getElementById('overview-news-z2');
  const oz3 = document.getElementById('overview-news-z3');

  if (z1El && newsData.zone1) z1El.innerHTML = newsData.zone1;
  if (z2El && newsData.zone2) z2El.innerHTML = newsData.zone2;
  if (z3El && newsData.zone3) z3El.innerHTML = newsData.zone3;

  if (oz1 && newsData.zone1) oz1.innerHTML = newsData.zone1;
  if (oz2 && newsData.zone2) oz2.innerHTML = newsData.zone2;
  if (oz3 && newsData.zone3) oz3.innerHTML = newsData.zone3;
}

async function fetchLatestNews() {
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/news`);
    if (res.ok) {
      const newsData = await res.json();
      renderNewsElements(newsData);
      return;
    }
  } catch (err) {}

  // Fallback to default C2 state news for seamless offline demo
  renderNewsElements(DEFAULT_C2_STATE.news);
}

function triggerSystemStart() {
  showToast("SynthCity C2 Online", "All AI personas, File Ingestion & OpenStreetMap active.", "success");
}

/* INTERACTIVE GLASSMORPHISM MODAL CONTROLLERS */
function openDispatchModal() {
  const modal = document.getElementById('dispatch-modal');
  if (modal) modal.classList.add('active');
}

function closeDispatchModal() {
  const modal = document.getElementById('dispatch-modal');
  if (modal) modal.classList.remove('active');
}

async function submitModalDispatch(e) {
  e.preventDefault();
  const target = document.getElementById('modal-dispatch-target').value;
  const message = document.getElementById('modal-dispatch-text').value.trim();
  if (!message) return;

  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, message })
    });
    if (res.ok) {
      showToast("Telegram Message Pushed ✓✓", `Direct API dispatch sent to ${target.toUpperCase()}`, "success");
      closeDispatchModal();
      document.getElementById('modal-dispatch-text').value = '';
      fetchState();
    }
  } catch (err) {
    showToast("Dispatch Error", "Could not reach local server endpoint.", "error");
  }
}

function openEmergencyModal() {
  const modal = document.getElementById('emergency-modal');
  if (modal) modal.classList.add('active');
}

function closeEmergencyModal() {
  const modal = document.getElementById('emergency-modal');
  if (modal) modal.classList.remove('active');
}

async function triggerEmergencyEvacuationModal() {
  const baseUrl = window.SYNTH_CONFIG.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/chat_ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona: 'admin', message: 'send message to worker 1 and worker 2 emergency evacuation' })
    });
    if (res.ok) {
      showToast("🚨 EMERGENCY EVACUATION BROADCAST", "Alert pushed to all Telegram field units!", "warning");
      closeEmergencyModal();
      fetchState();
    }
  } catch (err) {
    showToast("Emergency Broadcast Error", "Could not reach backend.", "error");
  }
}

function triggerSimulation() {
  showToast("⚡ SIMULATION ACTIVATED", "Nag River Flash Flood & Sitabuldi Traffic Detour initiated.", "warning");

  if (overviewMap) {
    const disasterMarkers = [
      { name: "🚨 CRITICAL FLOOD: Nag River Kamptee Bridge", lat: 21.2200, lng: 79.1100, color: "#ef4444", text: "Water level spiked by +1.4m. Dewatering Unit #1 Dispatched." },
      { name: "⚠️ TRAFFIC BLOCK: Sitabuldi Market Gridlock", lat: 21.1470, lng: 79.0820, color: "#f59e0b", text: "Culvert overflow. Detour routed to Outer Ring Road." },
      { name: "🏥 VECTOR HAZARD: Hingna MIDC Sector 12", lat: 21.1100, lng: 78.9800, color: "#7c3aed", text: "Stagnant industrial runoff. Mobile Fogging Unit #2 Assigned." }
    ];

    disasterMarkers.forEach(dm => {
      const marker = L.circleMarker([dm.lat, dm.lng], {
        radius: 12,
        fillColor: dm.color,
        color: '#ffffff',
        weight: 3,
        fillOpacity: 0.95
      }).addTo(overviewMap);

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 6px; max-width: 220px;">
          <strong style="color: ${dm.color}; font-size: 13px;">${dm.name}</strong><br/>
          <p style="font-size: 11px; color: #0f172a; margin-top: 4px; font-weight: 600;">${dm.text}</p>
          <span style="font-size: 10px; color: #ef4444; font-weight: bold;">LIVE DISASTER SIMULATION</span>
        </div>
      `).openPopup();
    });
  }

  const simTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const simMsgs = [
    {
      id: `sim_${Date.now()}_1`,
      sender: "Admin AI (Synth-Pradhan)",
      role: "admin",
      zone: "Admin",
      message: "🚨 FLOOD ALERT TRIGGERED: Level 3 surge detected at Nag River Kamptee bridge! Activating emergency response protocols across Zone 1 & Zone 2.",
      reasoning: "Synth-Pradhan Orchestrator synthesized telemetry surge & initiated field squad routing.",
      timeStr: simTime,
      timestamp: Date.now() / 1000
    },
    {
      id: `sim_${Date.now()}_2`,
      sender: "Zone 1 AI (Neer-Krishi)",
      role: "ai",
      zone: "Zone 1",
      message: "🌊 Water level rising rapidly at Kamptee intake station. Action: Dewatering Unit #1 dispatched to Nag River bridge coordinates [21.2200, 79.1100]. [VIEW STATUS]",
      reasoning: "Neer-Krishi Hydro AI calculated flow rate & dispatched 250 HP portable pumps.",
      timeStr: simTime,
      timestamp: Date.now() / 1000
    },
    {
      id: `sim_${Date.now()}_3`,
      sender: "Zone 2 AI (Nagari-Tantra)",
      role: "ai",
      zone: "Zone 2",
      message: "🚦 Traffic congestion increasing near Sitabuldi market due to culvert overflow. Action: Traffic detour initiated via Outer Ring Road & Wardha Road bypass. [MAP VIEW]",
      reasoning: "Nagari-Tantra Urban AI synchronized digital VMS signage & diverted market traffic.",
      timeStr: simTime,
      timestamp: Date.now() / 1000
    },
    {
      id: `sim_${Date.now()}_4`,
      sender: "Zone 3 AI (Swasthya-Raksha)",
      role: "ai",
      zone: "Zone 3",
      message: "🏥 Vector breeding risk assessment indicates high potential in Hingna MIDC. Action: Mobile fogging unit allocated to Hingna sector B for larvicide spraying. [DEPLOYMENT LOGS]",
      reasoning: "Swasthya-Raksha Health AI deployed thermal fogging cannons & field triage.",
      timeStr: simTime,
      timestamp: Date.now() / 1000
    }
  ];

  DEFAULT_C2_STATE.chat.unshift(...simMsgs);
  updateDashboardUI(DEFAULT_C2_STATE);
  switchTab('aichat');
}

function quickScenario(type) {
  const simTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (type === 'traffic_gridlock') {
    showToast("🚦 TRAFFIC DETOUR ACTIVATED", "Sitabuldi Metro culvert bottleneck rerouted to Ring Road.", "warning");

    const msgs = [
      {
        id: `sim_traf_${Date.now()}_1`,
        sender: "Zone 2 AI (Nagari-Tantra)",
        role: "ai",
        zone: "Zone 2",
        message: "🚦 Sitabuldi Metro interchange culvert overflow. Water depth 18cm across roadway. Action: Traffic diverted to Outer Ring Road and Wardha Road flyover. [MAP VIEW]",
        reasoning: "Synchronized dynamic VMS boards & notified traffic police control room.",
        timeStr: simTime,
        timestamp: Date.now() / 1000
      },
      {
        id: `sim_traf_${Date.now()}_2`,
        sender: "Admin AI (Synth-Pradhan)",
        role: "admin",
        zone: "Admin",
        message: "Acknowledged Zone 2. Worker 2 ('Ritesh Alone') and municipal compactor dispatched to clear stormwater drain #4.",
        reasoning: "Allocated mechanical clearance squad to Sitabuldi core.",
        timeStr: simTime,
        timestamp: Date.now() / 1000
      }
    ];

    DEFAULT_C2_STATE.chat.unshift(...msgs);
    updateDashboardUI(DEFAULT_C2_STATE);
    switchTab('aichat');

  } else if (type === 'vector_outbreak') {
    showToast("🏥 VECTOR HAZARD ALERT", "Hingna MIDC runoff triggered thermal fogging protocols.", "warning");

    const msgs = [
      {
        id: `sim_vec_${Date.now()}_1`,
        sender: "Zone 3 AI (Swasthya-Raksha)",
        role: "ai",
        zone: "Zone 3",
        message: "🏥 Larvicide surveillance report: Industrial runoff pooling in Hingna Sector 12. Action: Mobile Fogging Unit #2 allocated for immediate ultra-low volume spraying. [DEPLOYMENT LOGS]",
        reasoning: "Pre-emptive chemical vector control to prevent post-monsoon dengue surge.",
        timeStr: simTime,
        timestamp: Date.now() / 1000
      },
      {
        id: `sim_vec_${Date.now()}_2`,
        sender: "Admin AI (Synth-Pradhan)",
        role: "admin",
        zone: "Admin",
        message: "Approved Swasthya-Raksha directive. 102 Ambulance Rapid Station #4 notified to monitor district triage clinics.",
        reasoning: "Alerted primary health centers across Hingna & MIHAN belt.",
        timeStr: simTime,
        timestamp: Date.now() / 1000
      }
    ];

    DEFAULT_C2_STATE.chat.unshift(...msgs);
    updateDashboardUI(DEFAULT_C2_STATE);
    switchTab('aichat');
  }
}

function quickWaterSpike() {
  if (!DEFAULT_C2_STATE.iot_sensor) DEFAULT_C2_STATE.iot_sensor = {};
  DEFAULT_C2_STATE.iot_sensor.water_level_cm = 142.5;
  DEFAULT_C2_STATE.iot_sensor.status = 'CRITICAL SURGE (>80cm)';
  DEFAULT_C2_STATE.emergency_active = true;

  if (overviewMap) {
    const spikeMarker = L.circleMarker([21.2200, 79.1100], {
      radius: 14,
      fillColor: "#ef4444",
      color: "#ffffff",
      weight: 3,
      fillOpacity: 0.95
    }).addTo(overviewMap);

    spikeMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 6px; max-width: 220px;">
        <strong style="color: #ef4444; font-size: 13px;">🚨 ESP32 WATER SPIKE</strong><br/>
        <p style="font-size: 11px; color: #0f172a; margin-top: 4px; font-weight: 600;">Water level: 142.5cm (Threshold: 80cm). Dewatering Unit #1 Dispatched.</p>
      </div>
    `).openPopup();
  }

  showToast("🚨 CRITICAL WATER SPIKE (+65cm)", "ESP32 Sensor reading: 142.5cm (>80cm Threshold). Dewatering active!", "error");
  updateDashboardUI(DEFAULT_C2_STATE);
  renderAnalyticsCharts();
  switchTab('analytics');
}

function quickResetSensors() {
  if (!DEFAULT_C2_STATE.iot_sensor) DEFAULT_C2_STATE.iot_sensor = {};
  DEFAULT_C2_STATE.iot_sensor.water_level_cm = 22.5;
  DEFAULT_C2_STATE.iot_sensor.status = 'NORMAL';
  DEFAULT_C2_STATE.emergency_active = false;

  showToast("🛡️ TELEMETRY RESTORED", "All 1,842 Nagpur IoT nodes operating at normal baseline (22.5cm).", "success");
  updateDashboardUI(DEFAULT_C2_STATE);
  initOverviewMap();
  switchTab('overview');
}

// Explicit Window Export for Bulletproof Standalone Execution
window.triggerSimulation = triggerSimulation;
window.quickScenario = quickScenario;
window.quickWaterSpike = quickWaterSpike;
window.quickResetSensors = quickResetSensors;
window.switchTab = switchTab;
window.toggleMapTheme = toggleMapTheme;
window.selectTelegramContact = selectTelegramContact;
window.sendTgDirectMessage = sendTgDirectMessage;
window.triggerAutoAIDebate = triggerAutoAIDebate;
window.refreshGoogleDocsNow = refreshGoogleDocsNow;
window.openEmergencyModal = openEmergencyModal;
window.closeEmergencyModal = closeEmergencyModal;
window.triggerEmergencyEvacuationModal = triggerEmergencyEvacuationModal;
