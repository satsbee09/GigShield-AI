# ─────────────────────────────────────────────────────
# GigShield AI Engine  —  main.py
#
# ANALOGY: This is the actuary (the person at an insurance
# company who does all the math).
#
# It runs as a SEPARATE server on port 8000.
# The Node.js server talks to this via HTTP.
#
# Jobs:
#   1. Risk scorer      → "What weekly premium should Ravi pay?"
#   2. Workability      → "Is the disruption bad enough to pay out?"
#   3. Simulate         → "Demo mode — fake extreme weather"
#   4. Payout           → "How much should the worker receive?"
#   5. Fraud check      → "Is this claim legitimate?"
# ─────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx, os
from typing import Optional

app = FastAPI(title="GigShield AI Engine")

# Allow React frontend (port 5173) and Node backend (port 5000) to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
from dotenv import load_dotenv
load_dotenv()
OW_KEY = os.getenv("OPENWEATHER_KEY")

# ─────────────────────────────────────────────────────
# Request models
# ─────────────────────────────────────────────────────

class RiskScoreRequest(BaseModel):
    zone: str
    platform: str
    lat: float = 28.6273
    lon: float = 77.2773

class WorkabilityRequest(BaseModel):
    lat: float
    lon: float
    zone: str = ""

class PayoutRequest(BaseModel):
    expected_earning: float
    payout_percent: float
    disrupted_hours: float
    total_shift_hours: float

class FraudRequest(BaseModel):
    gps_in_zone: bool
    order_drop: float
    time_since_last_claim: float

# ─────────────────────────────────────────────────────
# Zone risk database
#
# ANALOGY: Like a property price list.
# Laxmi Nagar near Yamuna = high flood risk = higher premium.
# Gurugram Cyber City = mostly safe = low premium.
# ─────────────────────────────────────────────────────
ZONE_RISK = {
    "laxmi_nagar":     { "weather": 0.75, "flood": 0.80, "aqi": 0.60, "traffic": 0.50 },
    "yamuna_bank":     { "weather": 0.85, "flood": 0.90, "aqi": 0.55, "traffic": 0.45 },
    "dwarka":          { "weather": 0.60, "flood": 0.65, "aqi": 0.50, "traffic": 0.40 },
    "connaught_place": { "weather": 0.40, "flood": 0.20, "aqi": 0.55, "traffic": 0.70 },
    "gurugram":        { "weather": 0.25, "flood": 0.15, "aqi": 0.30, "traffic": 0.35 },
    "noida":           { "weather": 0.45, "flood": 0.40, "aqi": 0.65, "traffic": 0.50 },
    "default":         { "weather": 0.50, "flood": 0.40, "aqi": 0.50, "traffic": 0.45 },
}

# ─────────────────────────────────────────────────────
# CORE MATH
# ─────────────────────────────────────────────────────

def compute_risk_score(factors: dict) -> tuple:
    """
    Risk formula from story:
      Rz = 0.35*Fw + 0.25*Ff + 0.20*Fa + 0.20*Ft
      P  = 18 + floor(Rz * 24)   →  range ₹18–₹42
    """
    Rz = (
        0.35 * factors["weather"] +
        0.25 * factors["flood"]   +
        0.20 * factors["aqi"]     +
        0.20 * factors["traffic"]
    )
    premium = max(18, min(42, 18 + int(Rz * 24)))

    if   Rz < 0.35: tier = "low"
    elif Rz < 0.65: tier = "medium"
    else:           tier = "high"

    return round(Rz, 3), tier, premium


def compute_workability(rainfall_mm: float, temp_c: float, aqi: int) -> dict:
    """
    Workability formula from story:
      W = 100 − (sRain + sHeat + sAqi)

      sRain: 0 if < 20mm,  max 40 at >= 75mm
      sHeat: 0 if < 40°C,  max 25 at >= 50°C
      sAqi:  0 if < 200,   max 25 at >= 400

      Disruption when W < 50
      Payout% = (50 - W) / 50 * 100
    """
    s_rain = 0.0 if rainfall_mm < 20 else min((rainfall_mm - 20) / 55, 1.0) * 40
    s_heat = 0.0 if temp_c      < 40 else min((temp_c - 40)      / 10, 1.0) * 25
    s_aqi  = 0.0 if aqi         < 200 else min((aqi - 200)        / 200, 1.0) * 25

    W = max(0, round(100 - (s_rain + s_heat + s_aqi)))

    disruption = W < 50
    payout_pct = round((50 - W) / 50 * 100) if disruption else 0

    # Primary trigger type
    if   rainfall_mm >= 75: trigger = "heavy_rain"
    elif aqi         >= 400: trigger = "aqi"
    elif temp_c      >= 45:  trigger = "heat"
    else:                    trigger = "none"

    return {
        "workabilityScore": W,
        "disruptionActive": disruption,
        "payoutPercent":    payout_pct,
        "triggerType":      trigger,
        "breakdown": {
            "rainSubScore": round(s_rain, 1),
            "heatSubScore": round(s_heat, 1),
            "aqiSubScore":  round(s_aqi,  1),
        }
    }


# ─────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "GigShield AI Engine running 🚀", "port": 8000}


# ── 1. Risk Score ────────────────────────────────────
@app.post("/risk-score")
def risk_score(req: RiskScoreRequest):
    """
    Called when worker registers.
    Returns riskScore, premiumTier, weeklyPremium.
    """
    factors          = ZONE_RISK.get(req.zone.lower(), ZONE_RISK["default"])
    Rz, tier, premium = compute_risk_score(factors)
    coverage         = {"low": 400, "medium": 600, "high": 850}

    return {
        "zone":           req.zone,
        "riskScore":      Rz,
        "premiumTier":    tier,
        "weeklyPremium":  premium,
        "coverageAmount": coverage[tier],
        "breakdown": {
            "weatherRisk": round(factors["weather"], 2),
            "floodRisk":   round(factors["flood"],   2),
            "aqiRisk":     round(factors["aqi"],     2),
            "trafficRisk": round(factors["traffic"], 2),
        }
    }


# ── 2. Live Workability (GET) ────────────────────────
@app.get("/workability")
async def workability(lat: float, lon: float, zone: str = ""):
    """
    Called by Node.js trigger monitor every 10 minutes.
    Tries real OpenWeather API; falls back to mock data.
    """
    rainfall_mm = 0.0
    temp_c      = 32.0
    aqi         = 85
    source      = "mock"

    if OW_KEY:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params={"lat": lat, "lon": lon, "appid": OW_KEY}
                )
                data        = r.json()
                rainfall_mm = data.get("rain", {}).get("3h", 0.0)
                temp_c      = data["main"]["temp"] - 273.15
                source      = "openweather"
        except Exception as e:
            print(f"⚠️  Weather API error: {e}")

    result = compute_workability(rainfall_mm, temp_c, aqi)
    result["weather"] = {
        "rainfall_mm": round(rainfall_mm, 1),
        "temp_c":      round(temp_c, 1),
        "aqi":         aqi,
        "source":      source,
    }
    return result


# ── 3. Simulate Disruption (POST) ───────────────────
@app.post("/workability/simulate")
def simulate_workability(
    rainfall_mm: float = 82,
    temp_c:      float = 28,
    aqi:         int   = 145,
):
    """
    Demo endpoint — pass extreme values to trigger a payout.

    Example (query params):
      POST /workability/simulate?rainfall_mm=100&temp_c=45&aqi=400

    Extreme scenario:
      rainfall_mm=100, temp_c=45, aqi=400
      → workabilityScore ≈ 15, payoutPercent ≈ 70%
    """
    result = compute_workability(rainfall_mm, temp_c, aqi)
    result["simulated"] = True
    result["inputs"] = {
        "rainfall_mm": rainfall_mm,
        "temp_c":      temp_c,
        "aqi":         aqi,
    }
    return result


# ── 4. Payout Calculator ─────────────────────────────
@app.post("/payout")
def payout(req: PayoutRequest):
    """
    Payout = expected_earning × payout% × (disrupted_hours / shift_hours)
    """
    amount = (
        req.expected_earning *
        (req.payout_percent / 100) *
        (req.disrupted_hours / req.total_shift_hours)
    )
    return {"payoutAmount": round(amount, 2)}


# ── 5. Fraud Detection ───────────────────────────────
@app.post("/fraud-check")
def fraud_check(req: FraudRequest):
    """
    Simple rule-based fraud scorer.
    Score < 0.4  → auto-approve
    Score 0.4–0.7 → manual review
    Score >= 0.7  → auto-reject

    Phase 3: replace with Isolation Forest trained on
    historical claim patterns.
    """
    score = 0.0

    if not req.gps_in_zone:
        score += 0.5                        # not in disruption zone

    if req.order_drop < 0.2:
        score += 0.3                        # orders barely dropped

    if req.time_since_last_claim < 2:
        score += 0.2                        # claimed very recently

    score = round(min(score, 1.0), 2)

    if   score < 0.4: decision = "approve"
    elif score < 0.7: decision = "review"
    else:             decision = "reject"

    return {
        "fraudScore": score,
        "decision":   decision,
        "reason": {
            "gps_mismatch":     not req.gps_in_zone,
            "low_order_drop":   req.order_drop < 0.2,
            "recent_claim":     req.time_since_last_claim < 2,
        }
    }


# ─────────────────────────────────────────────────────
# Run with:
#   cd ai-engine
#   venv\Scripts\activate
#   uvicorn main:app --reload --port 8000
# ─────────────────────────────────────────────────────