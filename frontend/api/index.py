"""
Sarvam API — FastAPI backend for the Intelligent Candidate Discovery Platform.
"""

import time
import platform
import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Any

from rank import rank_candidates

# ── App Configuration ────────────────────────────────────────────────────

app = FastAPI(
    title="Sarvam Ranking Engine",
    description="Deterministic, CPU-only candidate ranking engine for Redrob Hackathon v4",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Boot timestamp ───────────────────────────────────────────────────────
BOOT_TIME = time.time()


# ── Models ───────────────────────────────────────────────────────────────

class RankRequest(BaseModel):
    candidates: list[dict[str, Any]]


class HealthResponse(BaseModel):
    status: str
    engine: str
    version: str
    uptime_seconds: float
    platform: str
    python_version: str
    timestamp: str


# ── Endpoints ────────────────────────────────────────────────────────────

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(content=b"", media_type="image/x-icon")

@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check with system load metrics."""
    return HealthResponse(
        status="operational",
        engine="Sarvam Deterministic Ranking Engine v1.0",
        version="1.0.0",
        uptime_seconds=round(time.time() - BOOT_TIME, 2),
        platform=f"{platform.system()} {platform.release()}",
        python_version=platform.python_version(),
        timestamp=datetime.utcnow().isoformat() + "Z"
    )


@app.post("/api/rank-samples")
async def rank_samples(request: RankRequest):
    """
    Accept candidate JSON objects and return ranked Top 100.
    """
    candidates = request.candidates

    if not candidates:
        raise HTTPException(status_code=400, detail="No candidates provided")

    if len(candidates) > 200_000:
        raise HTTPException(
            status_code=400,
            detail=f"Too many candidates: {len(candidates)}. Max is 200,000."
        )

    result = rank_candidates(candidates)

    return {
        "success": True,
        "data": result
    }



