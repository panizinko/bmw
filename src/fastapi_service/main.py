from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi_service.models import Message
from fastapi_service.routers import users

app = FastAPI(title="Budget Planner API")

origins = [
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1")


@app.get("/", response_model=Message, tags=["root"])
def read_root() -> Message:
    return Message(message="Hello, World!")
