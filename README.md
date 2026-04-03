# GigShield AI - Gig Worker Insurance Demo (Guidewire DEVTrails 2026)

GigShield is AI-powered insurance for delivery workers. Auto-detects rain/pollution/heat via weather APIs, auto-files claims, instant payouts via Razorpay.

## Tech Stack
- Frontend: React + Vite
- Backend: Node/Express + MongoDB Atlas
- AI Engine: FastAPI Python + OpenWeather API
- Payments: Razorpay Sandbox
- Auto-claims: Node-cron + AI workability score

## Quick Setup (5 mins)

1. **MongoDB Atlas** (free tier)
   ```
   mongodb.com/atlas → New Cluster → Connect → Drivers → Copy Connection String
   ```
   Add to `.env`: `MONGO_URI=...`

2. **Keys** (copy .env.example → .env)
   ```
   RAZORPAY_KEY_ID=rzp_test_... (razorpay.com dashboard → Test API Keys)
   OPENWEATHER_KEY=... (openweathermap.org/api → Sign up free)
   ```

3. **Install & Run** (3 terminals)
   ```
   # Terminal 1: AI Engine
   cd gigshield/ai-engine
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000

   # Terminal 2: Server + Mongo
   cd gigshield/server
   npm install
   npm run dev    # port 5000, auto-reload

   # Terminal 3: Client
   cd gigshield/client
   npm install
   npm run dev    # port 3000
   ```

4. **Open http://localhost:3000** → Onboard → Buy Policy → Simulate

## Demo Flow (Video Script)

1. **Onboard Ravi (Laxmi Nagar Zomato)** → AI computes ₹42 premium (flood risk)
2. **Buy Policy** → Razorpay sandbox (no real charge)
3. **Dashboard** → Live W-score polling, policy status
4. **Admin Simulate Rain** (curl or Postman):
    ```
    curl -X POST http://localhost:5000/api/admin/simulate \\
      -H "Content-Type: application/json" \\
      -d '{"zone":"laxmi_nagar", "scenario":"heavy_rain"}'
    ```
5. **Auto-claim fires** (check server logs) → Dashboard updates +₹480 payout
6. **Claims tab** → History with statuses

## Key Features

| Feature | How |
|---------|-----|
| **AI Risk Score** | Zone factors → Premium ₹18-42 |
| **Live Workability** | W = 100 - (rain+heat+aqi), triggers at W<50 |
| **Zero-Touch Claims** | Cron → AI → Fraud check → Razorpay payout (60s) |
| **Fraud Prevention** | 20h cooldown, zone GPS, API confirm |

## Testing Disruptions (Dev)

- Postman: `/api/admin/simulate` body `{ "zone": "laxmi_nagar", "scenario": "heavy_rain" }`
- AI Simulate: `curl -X POST http://localhost:8000/workability/simulate -d '{"rainfall_mm":82,"temp_c":28,"aqi":145}'`
- Logs: Server terminal shows trigger → claim → payout

## Production Notes

- Scale cron with Redis queues
- GPS verify worker location (Phase 3)
- SMS OTP (Twilio)
- Real Razorpay payouts (worker bank link)
- ML risk model (XGBoost on 5yr Delhi data)

Built by ByteBrigade 🚀
