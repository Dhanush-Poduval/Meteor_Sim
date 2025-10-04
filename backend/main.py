from fastapi import FastAPI,Depends
from fastapi.params import Form
from . import model , schemas
from sqlalchemy.orm import Session
from .databse import engine,get_db
from typing import List
app=FastAPI()

model.Base.metadata.create_all(bind=engine)

@app.get("/")
def test():
    return "Test successfull"

@app.post('/meteor')
def meteor(schemas:schemas.Add_Meteor,db:Session=Depends(get_db)):
    meteor=model.Meteor(name=schemas.name,speed=schemas.speed,mass=schemas.mass,radius=schemas.radius)
    db.add(meteor)
    db.commit()
    db.refresh(meteor)
    return{
        'name':schemas.name,
        'speed':schemas.speed,
        'mass':schemas.mass,
        'radius':schemas.radius
    }

@app.get('/meteors',response_model=List[schemas.Show_Meteor])
def show_meteor(db:Session=Depends(get_db)):
    meteor=db.query(model.Meteor).all()
    return meteor
