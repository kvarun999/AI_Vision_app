from fastapi import FastAPI
from app.routers import upload, analyze, generate
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine
from app.models.base import Base

from app.models import media, analysis, generation

Base.metadata.create_all(bind=engine)


app = FastAPI(title="AI Vision App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(generate.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}