from pydantic import BaseModel
from typing import Optional

class Add_Meteor(BaseModel):
   
    name: str
    speed: float
    radius: float
    material:str
class Show_Meteor(BaseModel):
    name: str
    speed: float
    radius: float
    material:str
    

    class Config:
        orm_mode = True