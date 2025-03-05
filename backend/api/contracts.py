from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from models.contracts import Contract, ExpectedFeeCalculation
from services.contract_service import (
    get_contract_by_id, 
    get_client_contract,
    calculate_expected_fee
)

router = APIRouter(prefix="/contracts", tags=["contracts"])

@router.get("/{contract_id}", response_model=Contract)
async def read_contract(contract_id: int):
    try:
        contract = get_contract_by_id(contract_id)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        return contract
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/client/{client_id}", response_model=Contract)
async def read_client_contract(client_id: int):
    try:
        contract = get_client_contract(client_id)
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found for this client")
        return contract
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{contract_id}/expected-fee", response_model=ExpectedFeeCalculation)
async def calculate_fee(
    contract_id: int,
    total_assets: Optional[float] = Query(None, description="Total assets for percentage-based fees")
):
    try:
        fee_calculation = calculate_expected_fee(contract_id, total_assets)
        return fee_calculation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))