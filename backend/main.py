from fastapi import FastAPI,Depends,HTTPException,status
from fastapi.params import Form
from . import model , schemas
from sqlalchemy.orm import Session
from .databse import engine,get_db
from typing import List
import math
import random
app=FastAPI()

model.Base.metadata.create_all(bind=engine)

def calc_crater( speed , radius , type):
    type=type.lower()
    if type=='iron':
        density=7800
    elif type=='stony':
        density=3000
    elif type=='stony iron':
        density=4500
    mass=(4/3)*math.pi*(radius**3)*density
    a=1.8
    b=0.28
    speed_meters=speed*1000
    energy=0.5*mass*(speed_meters**2)
    crater_diameter=a*(energy**b)
    return crater_diameter

def will_hit(speed , radius , angle):
    if radius<1 and speed<12:
        return "Burned up in atmosphere"
    if angle<10:
        return "Skipped"
    
    return "impact"

def crater_impact(lat,lon,speed,angle):
    speed_meters=speed*1000
    angle=math.radians(angle)
    azimuth=math.radians(random.uniform(0,360))
    g=9.81
    h=100_000
    t_fall=math.sqrt((2*h)/g)
    x_m=speed_meters*math.cos(angle)*t_fall
    dx=x_m*math.cos(azimuth)
    dy=x_m*math.sin(azimuth)
    R=6371_000
    impact_lat=lat+math.degrees(dy/R)
    impact_lon=lon+math.degrees(dx/(R*math.cos(math.radians(lat))))
    return impact_lat,impact_lon

@app.post('/meteor')
def meteor(schemas:schemas.Add_Meteor,db:Session=Depends(get_db)):
    meteor=model.Meteor(name=schemas.name,speed=schemas.speed,radius=schemas.radius,material=schemas.material)
    db.add(meteor)
    db.commit()
    db.refresh(meteor)
    return{
        'name':schemas.name,
        'speed':schemas.speed,
        'radius':schemas.radius,
        'type':schemas.material
    }

@app.get('/meteors',response_model=List[schemas.Show_Meteor])
def show_meteor(db:Session=Depends(get_db)):
    meteor=db.query(model.Meteor).all()
    if not meteor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="No meteors found")
    return meteor

@app.post('/crater')
def create_crater(crater:schemas.Crater, db:Session=Depends(get_db),):
    meteor=db.query(model.Meteor).filter(model.Meteor.id==crater.id).first()
    if not meteor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Meteor not found")
    outcome=will_hit(meteor.speed,meteor.radius,crater.angle)
    if outcome=="burned":
        return {"message":"Meteor burned up in atmosphere"}
    if outcome=="Skipped":
        return {"message":"Meteor skipped off atmosphere"}
    
    new_crater=calc_crater(meteor.speed,meteor.radius,meteor.material)
    lat,lon=crater_impact(crater.crater_lat , crater.crater_lon,meteor.speed,crater.angle)
    return{
        'crater_size':new_crater,
        'crater_lat':lat,
        'crater_lon':lon
    }
    