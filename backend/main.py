from fastapi import FastAPI,Depends,HTTPException,status
from fastapi.params import Form
from . import model , schemas
from sqlalchemy.orm import Session
from .databse import engine,get_db
from typing import List
import math
app=FastAPI()

model.Base.metadata.create_all(bind=engine)

def calc_crater( speed , radius , type):
    if type=='iron':
        density=7800
    elif type=='Stony':
        density=3000
    elif type=='stony-iron':
        density=4500
    mass=(4/3)*math.pi*(radius**3)*density
    a=1.8
    b=0.28
    energy=0.5*mass*(speed**2)
    crater_diameter=a*(energy**b)
    return crater_diameter

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
def create_crater(id=int , db:Session=Depends(get_db)):
    meteor=db.query(model.Meteor).filter(model.Meteor.id==id).first()
    crater=calc_crater(meteor.speed,meteor.radius,meteor.material)
    return{
        'crater_size':crater
    }
    