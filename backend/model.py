from .databse import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, ForeignKey

class Meteor(Base):
    __tablename__="craters"

    id=Column(Integer, primary_key=True, index=True)
    neo_id=Column(String, index=True)
    name=Column(String, index=True)
    speed=Column(Float)
    radius=Column(Float) 
    crater_size=Column(Float)
    lat=Column(Float)  
    lon=Column(Float)
    impact=Column(String)
    earthquake_mag=Column(Float)
    tsunami_radius=Column(Float)