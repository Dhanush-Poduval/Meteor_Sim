from .databse import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, ForeignKey

class Meteor(Base):
    __tablename__="meteors"

    id=Column(Integer, primary_key=True, index=True)
    name=Column(String, index=True)
    speed=Column(Float)
    mass=Column(Float)
    radius=Column(Float)  