from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import models
from .api import intercept, dashboard, traces, incidents, reviews

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sentinel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intercept.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(traces.router, prefix="/api/v1")
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "Healthy",
        "proxy": "Healthy",
        "fast_lane": "Healthy",
        "slow_lane": "Healthy",
        "database": "Healthy"
    }

@app.get("/")
def read_root():
    return {
        "status": "Sentinel Backend is Live! 🚀",
        "message": "The AI oversight proxy is running.",
        "documentation": "/docs"
    }
