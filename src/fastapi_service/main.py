from fastapi import FastAPI
from pydantic import BaseModel

class Message(BaseModel):
    message: str

app = FastAPI()

@app.get("/")
def read_root() -> Message:
    return Message(message="Hello, World!")