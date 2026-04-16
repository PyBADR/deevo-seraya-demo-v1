"""Seraya Co-Pilot — FastAPI backend entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routes.api import router

app = FastAPI(
    title="Seraya Retail Planning Co-Pilot",
    description="Backend API for Alyasra retail planning intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok"}
