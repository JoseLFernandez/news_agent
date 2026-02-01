from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(title="news_agent backend")
app.include_router(router)
