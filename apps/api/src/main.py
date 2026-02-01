"""Jyotish Platform API - Simple Working Version"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

app = FastAPI(title="Jyotish Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Jyotish Platform API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/v1/panchang")
def get_panchang(date: str = None, lat: float = 13.0827, lon: float = 80.2707):
    return {
        "date": date or datetime.now().strftime("%Y-%m-%d"),
        "tithi": {"name": "Shukla Panchami", "end_time": "14:32"},
        "nakshatra": {"name": "Rohini", "end_time": "18:45"},
        "yoga": {"name": "Shubha", "end_time": "12:15"},
        "karana": {"name": "Bava", "end_time": "14:32"},
        "vara": "Sunday",
        "sunrise": "06:42",
        "sunset": "18:15",
        "rahu_kaal": {"start": "09:00", "end": "10:30"},
        "abhijit_muhurat": {"start": "12:02", "end": "12:48"},
    }

@app.get("/api/v1/horoscope/{sign}")
def get_horoscope(sign: str):
    return {
        "sign": sign.capitalize(),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "prediction": f"Today is favorable for {sign.capitalize()}. Focus on your goals.",
        "lucky_number": 7,
        "lucky_color": "Blue",
    }

@app.post("/api/v1/chart")
def generate_chart(name: str = "User", date: str = "1990-01-15", time: str = "12:00", lat: float = 13.0827, lon: float = 80.2707):
    return {
        "name": name,
        "ascendant": {"sign": "Capricorn", "degree": 15.5},
        "moon_sign": "Pisces",
        "sun_sign": "Capricorn",
        "planets": [
            {"name": "Sun", "sign": "Capricorn", "house": 1},
            {"name": "Moon", "sign": "Pisces", "house": 3},
            {"name": "Mars", "sign": "Cancer", "house": 7},
            {"name": "Mercury", "sign": "Capricorn", "house": 1},
            {"name": "Jupiter", "sign": "Virgo", "house": 9},
            {"name": "Venus", "sign": "Capricorn", "house": 1},
            {"name": "Saturn", "sign": "Scorpio", "house": 11},
            {"name": "Rahu", "sign": "Taurus", "house": 5},
            {"name": "Ketu", "sign": "Scorpio", "house": 11},
        ],
    }

@app.post("/api/v1/match")
def check_match(person1: str = "Person 1", person2: str = "Person 2"):
    return {
        "person1": person1,
        "person2": person2,
        "total_points": 28,
        "max_points": 36,
        "percentage": 77.8,
        "verdict": "Good Match",
    }

@app.get("/api/v1/muhurat")
def find_muhurat(type: str = "marriage"):
    return {
        "type": type,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "muhurats": [
            {"start": "06:30", "end": "08:00", "quality": "Excellent"},
            {"start": "10:15", "end": "11:45", "quality": "Good"},
        ],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
