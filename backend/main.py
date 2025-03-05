from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import APP_NAME, APP_VERSION, ORIGINS
from api import clients, contracts, payments

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="API for 401(k) payment tracking system",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients.router)
app.include_router(contracts.router)
app.include_router(payments.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": f"{APP_NAME} API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}