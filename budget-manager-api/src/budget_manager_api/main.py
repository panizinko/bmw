from budget_manager_api.models import Message
from budget_manager_api.routers import auth, users
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from budget_manager_api.logging_config import setup_logging

setup_logging()

app = FastAPI(title="Budget Planner API")

API_PREFIX = "/api/v1"

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

app.include_router(users.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)


@app.get("/", response_model=Message, tags=["root"])
def read_root() -> Message:
    return Message(message="Hello, World!")
