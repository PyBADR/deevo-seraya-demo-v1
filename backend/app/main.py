"""Seraya Co-Pilot — FastAPI backend entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.api import router

app = FastAPI(
    title="Seraya Retail Planning Co-Pilot",
    description="Backend API for Alyasra retail planning intelligence",
    version="1.0.0",
)

# CORS: restrict to FRONTEND_URL in production, allow all in development
_origins = ["*"] if settings.APP_ENV == "development" else [settings.FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}
