from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from core.database import execute_query
from models.clients import Client, ClientSummary
from services.client_service import get_all_clients, get_client_by_id, get_client_summary

router = APIRouter(prefix="/clients", tags=["clients"])

@router.get("/", response_model=List[Client])
async def read_clients(
    provider: Optional[str] = Query(None, description="Filter by provider name")
):
    try:
        clients = get_all_clients(provider)
        return clients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{client_id}", response_model=Client)
async def read_client(client_id: int):
    try:
        client = get_client_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        return client
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{client_id}/summary", response_model=ClientSummary)
async def read_client_summary(client_id: int):
    try:
        summary = get_client_summary(client_id)
        if not summary:
            raise HTTPException(status_code=404, detail="Client not found")
        return summary
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))