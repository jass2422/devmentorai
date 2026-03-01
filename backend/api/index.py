import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from getstream import Stream
from mangum import Mangum

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

stream_client = Stream(
    api_key=os.getenv("STREAM_API_KEY"),
    api_secret=os.getenv("STREAM_API_SECRET"),
)

@app.get("/api/token")
def get_token(user_id: str):
    token = stream_client.create_token(user_id)
    return {"token": token}

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "DevMentor AI Backend Running!"}

# Vercel handler
handler = Mangum(app)