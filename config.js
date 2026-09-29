/**
 * ================================================================================
 * PROJECT SYNTHCITY: FRONTEND CONFIGURATION & WATERMARK-FREE MAP TILES (2026 STANDARD)
 * ================================================================================
 */

window.SYNTH_CONFIG = {
  // Local C2 Engine Backend Endpoint (Zero Firebase Dependency)
  API_BASE_URL: "http://localhost:8000",

  // CARTO & ESRI Watermark-Free Licensed Tile Layers (2026 Key Integrated)
  MAP_TILES: {
    voyager: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_3nqq_1_a586e19e0c11eefc021be78b",
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    realistic: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=cb1_3nqq_1_a586e19e0c11eefc021be78b",
    esri: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a> &copy; Esri'
  },

  // Nagpur Map Coordinates
  NAGPUR_COORDINATES: {
    lat: 21.1458,
    lng: 79.0882,
    zoom: 12
  },

  // Telegram Credentials Summary
  TELEGRAM: {
    WORKER_1_NAME: "U (Worker 1)",
    WORKER_2_NAME: "Ritesh Alone (Worker 2 Admin)",
    CITIZEN_Z2_NAME: "Dhynendra Gaurkar (Citizen Z2)"
  },

  // 3 Distinct Contiguous Zone Boundaries (Zero Gaps, Natural Geographic Partition)
  ZONES: {
    zone1: {
      id: "zone1",
      name: "Zone 1: Neer-Krishi",
      subtitle: "Kamptee Regional & Hydro-Agri Node",
      color: "#0284c7", // Cyan / Sky Blue
      borderColor: "#0284c7",
      fillOpacity: 0.28,
      center: [21.2225, 79.1800],
      docUrl: "https://docs.google.com/document/d/11UXOyAbyGhIhegMV2bNhZy0SYJNiy0t4zuEl9QHnTt8/edit?usp=sharing",
      bounds: [
        [21.2650, 79.1450], // Koradi north edge
        [21.2680, 79.2150], // Kanhan river north bend
        [21.2450, 79.2550], // Juni Kamptee barrage
        [21.2100, 79.2500], // Dragon Palace east
        [21.1750, 79.2100], // Kamptee highway south-east
        [21.1750, 79.1650], // Shared border with Zone 2 (East)
        [21.1780, 79.1150], // Shared border with Zone 2 (Central)
        [21.1750, 79.0750], // Shared triple junction (Z1, Z2, Z3)
        [21.2250, 79.0950]  // Godhani / Koradi west approach
      ]
    },
    zone2: {
      id: "zone2",
      name: "Zone 2: Nagari-Tantra",
      subtitle: "Urban Core Logistics & Infrastructure Node",
      color: "#d97706", // Amber / Gold
      borderColor: "#d97706",
      fillOpacity: 0.28,
      center: [21.1458, 79.0882],
      docUrl: "https://docs.google.com/document/d/1fo2hnkz4z6FVvRXOviorWFdYwLkAru8YojvmTenBIFY/edit?usp=sharing",
      bounds: [
        [21.1750, 79.0750], // Shared triple junction (Z1, Z2, Z3)
        [21.1780, 79.1150], // Shared border with Zone 1
        [21.1750, 79.1650], // Shared border with Zone 1 (East)
        [21.1450, 79.1720], // Itwari / Lakadganj east
        [21.1150, 79.1550], // Sakkardara / Reshimbagh south-east
        [21.1150, 79.0850], // Shared border with Zone 3 (South)
        [21.1280, 79.0600], // Shared border with Zone 3 (Dharampeth / Dhantoli)
        [21.1350, 79.0150], // Shared border with Zone 3 (Ambazari spillway)
        [21.1580, 79.0400]  // Law College / Seminary Hills
      ]
    },
    zone3: {
      id: "zone3",
      name: "Zone 3: Swasthya-Raksha",
      subtitle: "Hingna MIDC & MIHAN Health Corridor",
      color: "#7c3aed", // Purple
      borderColor: "#7c3aed",
      fillOpacity: 0.28,
      center: [21.0950, 79.0200],
      docUrl: "https://docs.google.com/document/d/1aE1sAMZj84afL4GTStQ6vTMMGrY8rpNfP-t_1TFAS6I/edit?usp=sharing",
      bounds: [
        [21.1750, 79.0750], // Shared triple junction (Z1, Z2, Z3)
        [21.1580, 79.0400], // Shared border with Zone 2
        [21.1350, 79.0150], // Shared border with Zone 2 (Ambazari)
        [21.1280, 79.0600], // Shared border with Zone 2
        [21.1150, 79.0850], // Shared border with Zone 2 (South)
        [21.0750, 79.0950], // MIHAN IT / Health SEZ south-east
        [21.0550, 79.0550], // Butibori / MIHAN south approach
        [21.0600, 79.0050], // Hingna MIDC Sector 12 south
        [21.0850, 78.9650], // Hingna Industrial west
        [21.1250, 78.9750]  // Wadi / ICAR west approach
      ]
    }
  }
};
