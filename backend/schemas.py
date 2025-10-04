from pydantic import BaseModel
from typing import Optional

class Add_Meteor(BaseModel):
   
    name: str
    speed: float
    mass: float
    radius: float
class Show_Meteor(BaseModel):
    name: str
    speed: float
    mass: float
    radius: float

    class Config:
        orm_mode = True