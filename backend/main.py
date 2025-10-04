from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from . import model,schemas
from .databse import get_db ,engine
import math, random, httpx

app = FastAPI()

model.Base.metadata.create_all(bind=engine)

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NASA_API_KEY = "cvOcjjV8goKHNGY0tKXYZIsamGlawfU0bAd7kjIO"

class Crater(BaseModel):
    crater_lat: float
    crater_lon: float
    angle: float
    neo_id: str

def calc_crater(speed, radius, material="stony"):
    density = {"iron": 7800, "stony": 3000, "stony iron": 4500}.get(material.lower(), 3000)
    mass = (4/3) * math.pi * (radius**3) * density
    a, b = 1.8, 0.28
    speed_meters = speed * 1000
    energy = 0.5 * mass * (speed_meters**2)
    crater_diameter = a * (energy**b)
    return crater_diameter, energy

def crater_impact(lat, lon, speed, angle):
    speed_meters = speed * 1000
    angle = math.radians(angle)
    azimuth = math.radians(random.uniform(0, 360))
    g, h = 9.81, 100_000
    t_fall = math.sqrt((2*h)/g)
    x_m = speed_meters * math.cos(angle) * t_fall
    dx = x_m * math.cos(azimuth)
    dy = x_m * math.sin(azimuth)
    R = 6371_000
    impact_lat = lat + math.degrees(dy / R)
    impact_lon = lon + math.degrees(dx / (R * math.cos(math.radians(lat))))
    return impact_lat, impact_lon

def is_water(lat, lon):
    return lat < 0 or lon < 0

def estimate_earthquake(energy):
    return  2/3 * math.log10(energy) - 3.2 

def estimate_tsunami(energy):
    return min(500, (energy / 1e15)**(1/3) * 10)

@app.get("/neos")
async def get_neos():
    url = f"https://api.nasa.gov/neo/rest/v1/feed?api_key={NASA_API_KEY}"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        data = res.json()
    neos = []
    for day in data["near_earth_objects"]:
        for neo in data["near_earth_objects"][day]:
            neos.append({
                "id": neo["id"],
                "name": neo["name"],
                "speed": float(neo["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"]),
                "radius": float(neo["estimated_diameter"]["meters"]["estimated_diameter_max"] / 2),
                "hazardous": neo["is_potentially_hazardous_asteroid"]
            })
    return neos

@app.post("/crater")
async def create_crater(crater: Crater,db:Session=Depends(get_db)):
    url = f"https://api.nasa.gov/neo/rest/v1/neo/{crater.neo_id}?api_key={NASA_API_KEY}"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        if res.status_code != 200:
            raise HTTPException(status_code=404, detail="NEO not found")
        neo = res.json()

    speed = float(neo["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"])
    radius = float(neo["estimated_diameter"]["meters"]["estimated_diameter_max"] / 2)
    material = "stony"
    
    crater_size, energy = calc_crater(speed, radius, material)
    impact_lat, impact_lon = crater_impact(crater.crater_lat, crater.crater_lon, speed, crater.angle)
    
    water_hit = is_water(impact_lat, impact_lon)
    earthquake_mag = estimate_earthquake(energy) if not water_hit else 0
    tsunami_radius = estimate_tsunami(energy) if water_hit else 0

    craters=model.Meteor(
        neo_id=crater.neo_id,
        name=neo["name"],
        speed=speed,
        radius=radius,
        crater_size=crater_size,
        lat=impact_lat,
        lon=impact_lon,
        impact="water" if water_hit else "land",
        earthquake_mag=earthquake_mag,
        tsunami_radius=tsunami_radius)
    db.add(craters)
    db.commit()
    db.refresh(craters)
    return {
        "name": neo["name"],
        "speed": speed,
        "radius": radius,
        "crater_size": crater_size,
        "impact_lat": impact_lat,
        "impact_lon": impact_lon,
        "impact_type": "water" if water_hit else "land",
        "earthquake_mag": earthquake_mag,
        "tsunami_radius": tsunami_radius
    }

@app.get('/craters',response_model=list[schemas.ShowCrater])
def show_craters(db:Session=Depends(get_db)):
    craters=db.query(model.Meteor).all()
    return craters

@app.get('/meteor/{id}')
async def specific_meteor(id:str):
    url = f"https://api.nasa.gov/neo/rest/v1/feed?api_key={NASA_API_KEY}"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        data = res.json()
    neos = []
    for day in data["near_earth_objects"]:
        for neo in data["near_earth_objects"][day]:
            if neo["id"]==id:
                return{
                    "id": neo["id"],
                    "name": neo["name"],
                    "speed": float(neo["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"]),
                    "radius": float(neo["estimated_diameter"]["meters"]["estimated_diameter_max"] / 2),
                    "hazardous": neo["is_potentially_hazardous_asteroid"]
                }
   