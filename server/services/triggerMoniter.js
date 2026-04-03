// ─────────────────────────────────────────────────────
// Trigger Monitor
//
// ANALOGY: Think of this as a security guard
// who walks around every 10 minutes checking:
//   "Is it raining too hard?"
//   "Is AQI dangerously high?"
//   "Is there a curfew?"
//
// If YES → he automatically files a claim for every
// insured worker in that area. No human needed.
// ─────────────────────────────────────────────────────

const cron   = require('node-cron'); // Fixed filename reference if needed
const axios  = require('axios');
const Worker = require('../models/worker');
const { createAutoClaim } = require('../routes/claims');

// OpenWeather API — free tier is fine for demo
const OW_KEY = process.env.OPENWEATHER_KEY || '';

// ─────────────────────────────────────────────────────
// getWeatherData(lat, lon)
// Calls OpenWeather API and returns:
//   rainfall (mm in last 3h), temperature (°C)
// Falls back to mock data if no API key
// ─────────────────────────────────────────────────────
async function getWeatherData(lat, lon) {
  if (!OW_KEY) {
    // No API key — return safe (non-disruption) mock data
    // To test: temporarily return { rainfall: 82, tempC: 28 }
    return { rainfall: 0, tempC: 32, mock: true };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OW_KEY}`;
    const { data } = await axios.get(url);
    return {
      rainfall: data.rain?.['3h'] || 0,
      tempC:    data.main.temp - 273.15,
      mock:     false
    };
  } catch (err) {
    console.error('Weather API error:', err.message);
    return { rainfall: 0, tempC: 32, mock: true };
  }
}

// ─────────────────────────────────────────────────────
// getAQI(lat, lon)
// In Phase 2: returns mock AQI value
// In Phase 3: integrate CPCB API
// ─────────────────────────────────────────────────────
async function getAQI(lat, lon) {
  // Mock: return safe AQI
  // To test AQI trigger: return { aqi: 420 }
  return { aqi: 85, mock: true };
}

// ─────────────────────────────────────────────────────
// computeWorkabilityScore({ rainfall, tempC, aqi })
// The CORE FORMULA from your README:
//   W = 100 − (s_rain + s_heat + s_aqi)
//
// Each sub-score is 0–40 or 0–25:
//   rain ≥ 75mm  → s_rain  = 40  (full disruption)
//   temp ≥ 45°C  → s_heat  = 25  (dangerous heat)
//   aqi  ≥ 400   → s_aqi   = 25  (GRAP Stage 4)
// ─────────────────────────────────────────────────────
function computeWorkabilityScore({ rainfall, tempC, aqi }) {
  // Rain sub-score: 0 if < 20mm, scales to 40 at ≥ 75mm
  const sRain  = rainfall < 20 ? 0 : Math.min((rainfall - 20) / 55, 1) * 40;

  // Heat sub-score: 0 if < 40°C, scales to 25 at ≥ 50°C
  const sHeat  = tempC < 40 ? 0 : Math.min((tempC - 40) / 10, 1) * 25;

  // AQI sub-score: 0 if < 200, scales to 25 at ≥ 400
  const sAqi   = aqi < 200 ? 0 : Math.min((aqi - 200) / 200, 1) * 25;

  const W = Math.round(100 - (sRain + sHeat + sAqi));
  return Math.max(0, W);   // never go below 0
}

// ─────────────────────────────────────────────────────
// determineTriggerType({ rainfall, tempC, aqi })
// What caused the disruption? (for claim records)
// ─────────────────────────────────────────────────────
function determineTriggerType({ rainfall, tempC, aqi }) {
  if (rainfall >= 75)  return 'heavy_rain';
  if (aqi >= 400)      return 'aqi';
  if (tempC >= 45)     return 'heat';
  return 'heavy_rain'; // default
}

// ─────────────────────────────────────────────────────
// runCheck()
// The main function — runs every 10 minutes
// Checks every active worker's zone
// ─────────────────────────────────────────────────────
async function runCheck() {
  console.log(`\n🔍 [${new Date().toLocaleTimeString()}] Trigger monitor running...`);

  // Get all workers with active policies
  const workers = await Worker.find({ policyActive: true });
  if (workers.length === 0) {
    console.log('   No active workers to check.');
    return;
  }

  // Group workers by zone to avoid calling API for every single worker
  // If 50 workers are in laxmi_nagar, we call weather API ONCE for that zone
  const zoneMap = {};
  for (const w of workers) {
    const key = w.zone;
    if (!zoneMap[key]) {
      zoneMap[key] = { lat: w.zoneLat, lon: w.zoneLon, workers: [] };
    }
    zoneMap[key].workers.push(w);
  }

  // Check each zone
  for (const [zone, { lat, lon, workers: zoneWorkers }] of Object.entries(zoneMap)) {
    const [weatherData, aqiData] = await Promise.all([
      getWeatherData(lat, lon),
      getAQI(lat, lon)
    ]);

    const { rainfall, tempC } = weatherData;
    const { aqi } = aqiData;

    const W           = computeWorkabilityScore({ rainfall, tempC, aqi });
    const triggerType = determineTriggerType({ rainfall, tempC, aqi });
    const payoutPct   = W < 50 ? Math.round((50 - W) / 50 * 100) : 0;

    console.log(`   Zone: ${zone} | W=${W} | Rain=${rainfall}mm | Temp=${tempC.toFixed(1)}°C | AQI=${aqi}`);

    // Only fire claims if W < 50 (disruption confirmed)
    if (W < 50) {
      console.log(`   ⚡ DISRUPTION in ${zone}! Firing claims for ${zoneWorkers.length} workers...`);

      for (const worker of zoneWorkers) {
        await createAutoClaim({
          workerId:         worker._id,
          workabilityScore: W,
          payoutPercent:    payoutPct,
          triggerType
        });
      }
    }
  }

  console.log('   ✅ Check complete.\n');
}

// ─────────────────────────────────────────────────────
// Schedule: run every 10 minutes
// Cron syntax: '*/10 * * * *'
//   means: "every 10 minutes, every hour, every day"
// ─────────────────────────────────────────────────────
cron.schedule('*/10 * * * *', runCheck);

// Also run once immediately when server starts
runCheck();

module.exports = { runCheck, computeWorkabilityScore };