from fastapi import FastAPI,Depends
from fastapi.params import Form
from . import model
from sqlalchemy.orm import Session
from .databse import engine,get_db
app=FastAPI()

model.Base.metadata.create_all(bind=engine)

@app.get("/")
def test():
    return "Test successfull"

@app.post('/meteor')
def meteor(name:str=Form(...),speed:float=Form(...),mass:float=Form(...),radius:float=Form(...),db:Session=Depends(get_db)):
    meteor=model.Meteor(name=name,speed=speed,mass=mass,radius=radius)
    db.add(meteor)
    db.commit()
    db.refresh(meteor)
    return{
        'name':name,
        'speed':speed,
        'mass':mass,
        'radius':radius
    }
