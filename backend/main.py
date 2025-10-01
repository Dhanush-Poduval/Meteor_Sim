from fastapi import FastAPI
from fastapi.params import Form
app=FastAPI()

@app.get("/")
def test():
    return "Test successfull"

@app.post('/meteor')
def meteor(name:str=Form(...),speed:float=Form(...),mass:float=Form(...),radius:float=Form(...)):
    return{
        'name':name,
        'speed':speed,
        'mass':mass,
        'radius':radius
    }
