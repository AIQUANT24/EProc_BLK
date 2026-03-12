
# api/models.py
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class ExtractedTable(BaseModel):
    """Represents a table extracted from the document"""
    table_index: int
    headers: List[str] = []
    rows: List[Union[Dict[str, Any], List[Any]]] = []  # ← Direct data, not wrapped in "data"
    footer: Optional[Dict[str, str]] = None

class Heading(BaseModel):
    """Document heading"""
    level: str  # "h1", "h2", "h3", "h4", or "inferred"
    text: str








from pydantic import BaseModel
from typing import Dict, Any, List

class SupplierResponse(BaseModel):
    supplier: str
    component: Dict[str, str]  # "Component Name": "Total Value"
    origin: str  # NEW: "imported" or "domestic"
    percent_of_total: str  # NEW: "31.8%"
    fraud_detected: bool  # NEW: True/False   
    
class ExtractionResponse(BaseModel):
    data: List[SupplierResponse]  # ← NEW: Your array of supplier objects
    filename: str = ""
    processing_time: float = 0.0
    metadata: Dict[str, Any] = {}




# Keep these for backward compatibility if needed
class BOMItem(BaseModel):
    """Legacy BOM item model - kept for compatibility"""
    seq_no: str = ""
    description: str = ""
    consumption: Union[float, str, None] = None
    extra_purchase: str = ""
    quantity: Union[float, str, None] = None
    uom: str = ""
    rate: Union[float, str, None] = None
    price_unit: str = ""
    amount: Union[float, str, None] = None
    remarks: str = ""

    @field_validator('consumption', 'quantity', 'rate', 'amount', mode='before')
    @classmethod
    def validate_numeric_fields(cls, v):
        """Handle various numeric formats including empty strings and percentages"""
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            v = v.strip()
            if v == "" or v.lower() in ["null", "none"]:
                return None
            v = v.replace(',', '')
            if v.endswith('%'):
                try:
                    return float(v.rstrip('%'))
                except ValueError:
                    return v
            try:
                return float(v)
            except ValueError:
                return v
        return v

class BOMResponse(BaseModel):
    """Legacy BOM response model - kept for compatibility"""
    header: Dict[str, str] = {}
    items: List[BOMItem] = []
    total_amount: Union[float, str, None] = None
    metadata: Dict[str, Any] = {}
    filename: str = ""
    processing_time: float = 0.0

    @field_validator('total_amount', mode='before')
    @classmethod
    def validate_total_amount(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            v = v.replace(',', '').strip()
            if v == "":
                return None
            try:
                return float(v)
            except ValueError:
                return v
        return v

class JobStatusResponse(BaseModel):
    """Response model for job status"""
    job_id: str
    status: str
    message: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    output_file: Optional[str] = None

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    status_code: int = 400