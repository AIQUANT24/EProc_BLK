


from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import shutil
import time
from datetime import datetime
import uuid
from typing import Optional
import json
from loguru import logger
import re

from .models import BOMResponse, JobStatusResponse, ErrorResponse
from src.vision_extractor import SarvamDocumentIntelligence
from typing import List, Dict, Any

from .models import ExtractionResponse, JobStatusResponse, ErrorResponse
# Create router
router = APIRouter(prefix="/api/v1", tags=["BOM Extraction"])

# Store job statuses (in production, use a database)
job_statuses = {}

# Initialize processor
processor = SarvamDocumentIntelligence()



@router.post("/upload-and-extract", response_model=ExtractionResponse)
async def upload_and_extract(
    file: UploadFile = File(..., description="BOM image/PDF file (PNG, JPG, JPEG, PDF)"),
    language: str = "en-IN"
):
    """
    Upload a file and extract BOM data with supplier classification
    Returns: Array of individual supplier-component entries with DVA classification
    """
    temp_file_path = None
    
    try:
        # Start timing
        start_time = time.time()
        
        # Validate file type
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.pdf'}
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed: {allowed_extensions}"
            )
        
        # Save uploaded file temporarily
        upload_dir = Path("../uploads")
        upload_dir.mkdir(exist_ok=True)
        
        # Create unique filename
        temp_file_path = upload_dir / f"upload_{uuid.uuid4()}{file_ext}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File saved temporarily: {temp_file_path}")
        
        # Initialize processor
        processor = SarvamDocumentIntelligence()
        
        # Process the document using your existing method
        result = processor.process_document(
            file_path=str(temp_file_path),
            language=language,
            output_format="html"
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Processing failed: {result.get('error', 'Unknown error')}"
            )
        
        # Get the JSON output path
        json_path = result.get('extracted_data', {}).get('json_representation')
        if not json_path:
            raise HTTPException(
                status_code=500,
                detail="No JSON output generated"
            )
        
        # Read the extracted data
        with open(json_path, 'r', encoding='utf-8') as f:
            extracted_data = json.load(f)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
         #  # 🔥 TRANSFORM: Raw tables → Individual supplier-component array
        supplier_array = transform_bom_to_individual_suppliers(extracted_data.get("structured_tables", {}))

            # Extract totals using EXACT same logic from your transform function
        structured_tables = extracted_data.get("structured_tables", {})
        best_table = None
        best_score = -1
        for table_name, table in structured_tables.items():
                headers = table.get("headers", [])
                score = 0
                header_lower = [h.lower() for h in headers]
                if any("supplier" in h for h in header_lower): score += 30
                if any(kw in h for h in header_lower for kw in ["desc", "description", "component"]): score += 25
                if any("domestic" in h for h in header_lower): score += 20
                if any("total" in h and "value" in h for h in header_lower): score += 25
                if score > best_score:
                    best_score = score
                    best_table = table

        def parse_currency(val):
                if not val: return 0.0
                if isinstance(val, (int, float)): return float(val)
                val_str = str(val).strip()
                val_str = re.sub(r'[$₹€£¥]', '', val_str)
                val_str = val_str.replace(',', '')
                try: return float(val_str)
                except: return 0.0

        grand_total = grand_domestic = 0.0
        if best_table:
                footer = best_table.get("footer", {})
                if footer:
                    grand_total = parse_currency(footer.get("Total Value", footer.get("Total", 0)))
                    grand_domestic = parse_currency(footer.get("Domestic Value", footer.get("Domestic", 0)))
                else:
                    rows = best_table.get("rows", [])
                    headers = best_table.get("headers", [])
                    for row in rows:
                        first_col = str(row.get(headers[0], "")).strip().upper()
                        if first_col == "TOTAL":
                            grand_total = parse_currency(row.get("Total Value", row.get("Total", 0)))
                            grand_domestic = parse_currency(row.get("Domestic Value", row.get("Domestic", 0)))
                            break
                        
                
                
                  # NEW: Calculate DVA = (domestic_cost / total_cost) * 100
        dva_percentage = 0.0
        if grand_total > 0:
            dva_percentage = (grand_domestic / grand_total) * 100

        # NEW: DVA Classification (your exact conditions)
        if dva_percentage >= 50:
            classification = "class 1 local supplier"
        elif dva_percentage >= 20:
            classification = "class 2 local supplier"
        else:
            classification = "non local supplier"
                

            # NEW Response format - totals in metadata (works with your existing model)
        response_data = {
                "data": supplier_array,
                "filename": file.filename,
                "processing_time": round(processing_time, 2),
                "metadata": {
                    **extracted_data.get("metadata", {}),
                    "extraction_timestamp": datetime.now().isoformat(),
                    "total_items": len(supplier_array),
                    "total_cost": f"${grand_total:,.2f}",
                    "domestic_cost": f"${grand_domestic:,.2f}",
                    "dva_score": f"{dva_percentage:.1f}%",  # NEW: DVA percentage
                "classification": classification  # NEW: DVA classification
                }
            }

        
        logger.info(f"Extracted {len(supplier_array)} supplier-components from {file.filename}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload and extract failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
            logger.info(f"Deleted temp file: {temp_file_path}")




def transform_bom_to_individual_suppliers(structured_tables: dict) -> List[dict]:
    """
    100% DYNAMIC BOM parser - CORRECT DVA calculation
    Works with ANY table structure, ANY currency
    """
    if not structured_tables:
        return []

    def parse_currency(val: Any) -> float:
        """FIXED: Properly handles "$1,050.00" → 1050.0"""
        if not val:
            return 0.0
        if isinstance(val, (int, float)):
            return float(val)
        
        val_str = str(val).strip()
        # FIXED: Correct regex - NO double backslashes
        val_str = re.sub(r'[$₹€£¥]', '', val_str)  # ← FIXED
        val_str = val_str.replace(',', '')
        try:
            return float(val_str)
        except:
            return 0.0

    def score_table_for_bom(table: dict) -> tuple:
        headers = table.get("headers", [])
        score = 0
        header_lower = [h.lower() for h in headers]
        
        if any("supplier" in h for h in header_lower): score += 30
        if any(kw in h for h in header_lower for kw in ["desc", "description", "component"]): score += 25
        if any("domestic" in h for h in header_lower): score += 20
        if any("total" in h and "value" in h for h in header_lower): score += 25
        if any("qty" in h for h in header_lower): score += 10
        if any("unit" in h and "cost" in h for h in header_lower): score += 10
        if any(h.startswith('$') for h in headers): score -= 50
        
        return score, headers

    # Find best table
    best_table = None
    best_score = -1
    for table_name, table in structured_tables.items():
        score, _ = score_table_for_bom(table)
        if score > best_score:
            best_score = score
            best_table = table

    if not best_table:
        return []

    rows = best_table.get("rows", [])
    headers = best_table.get("headers", [])
    
    
      # DYNAMIC: Get total from footer (TOTAL row)
    grand_total = 0.0
    footer = best_table.get("footer", {})
    if footer and "Total Value" in footer:
        grand_total = parse_currency(footer["Total Value"])
    else:
        # Fallback: find TOTAL row in rows
        for row in rows:
            first_col = str(row.get(headers[0], "")).strip().upper()
            if first_col == "TOTAL" and "Total Value" in row:
                grand_total = parse_currency(row["Total Value"])
                break
    
    
      
    
    
    # Dynamic column detection (no hardcoding)
    col_indices = {"supplier": None, "component": None, "domestic_value": None, "total_value": None}
    
    for i, header in enumerate(headers):
        header_lower = header.lower()
        if any(kw in header_lower for kw in ["supplier", "vendor"]):
            col_indices["supplier"] = i
        elif any(kw in header_lower for kw in ["desc", "description", "component"]):
            col_indices["component"] = i
        elif "domestic" in header_lower:
            col_indices["domestic_value"] = i
        elif any(kw in header_lower for kw in ["total", "value"]):
            col_indices["total_value"] = i
        elif any(kw in header_lower for kw in ["unit", "cost", "rate"]):  # Dynamic unit cost detection
            col_indices["unit_cost"] = i

    response = []
    for row in rows:
        # Skip TOTAL row
        first_col = str(row.get(headers[0], "")).strip().upper()
        if first_col in ["TOTAL", ""]:
            continue
        
        supplier = str(row.get(headers[col_indices["supplier"]], "")).strip() if col_indices["supplier"] is not None else ""
        component = str(row.get(headers[col_indices["component"]], "")).strip() if col_indices["component"] is not None else ""
        
        # Extract Domestic and Total values
        domestic_raw = row.get(headers[col_indices["domestic_value"]], "") if col_indices["domestic_value"] is not None else ""
        total_raw = row.get(headers[col_indices["total_value"]], "") if col_indices["total_value"] is not None else ""
        
        domestic_val = parse_currency(domestic_raw)
        total_val = parse_currency(total_raw)
        
        if supplier and component and total_val > 0:
            
            
            
            # NEW: Calculate imported cost and origin
            imported_cost = total_val - domestic_val
            imported_pct = (imported_cost / total_val * 100) if total_val > 0 else 0
            origin = "imported" if imported_pct >= 50 else "domestic"
            
            
            # NEW: % of total = (component total / grand total) * 100
            percent_of_total = (total_val / grand_total * 100) if grand_total > 0 else 0
            
              # FRAUD DETECTION LOGIC
            fraud_detected = False
            fraud_message = None
            
            # Check 1: Imported cost > Total value (logical OR)
            if imported_cost > total_val:
                fraud_detected = True
                fraud_message = f"fraud detected. Imported cost of {component} is greater than total value of this {component}"
            
            # Check 2: Unit cost missing (logical OR)
            unit_cost_raw = row.get(headers[col_indices["unit_cost"]], "") if col_indices["unit_cost"] is not None else ""
            unit_cost_val = parse_currency(unit_cost_raw)
            if col_indices["unit_cost"] is not None and not unit_cost_raw.strip():
                fraud_detected = True
                if not fraud_message:  # Only set if no previous message
                    fraud_message = f" fraud detected. unit cost is missing in this {component}"
            
            # THROW ERROR if fraud detected
            if fraud_detected:
                raise HTTPException(status_code=400, detail=fraud_message)
            
            
            
            formatted_total = f"${total_val:,.2f}"
            
            response.append({
                "supplier": supplier,
                "component": {component: formatted_total},
                "origin": origin, # NEW FIELD ADDED
                "percent_of_total": f"{percent_of_total:.1f}%",  # NEW FIELD
                "fraud_detected": False  # NEW FIELD ADDED

            })
            
   

    return response












def safe_float(value):
    """Safely convert a value to float, return None if conversion fails"""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        value = value.strip()
        if value == "" or value.lower() in ["null", "none"]:
            return None
        # Remove commas
        value = value.replace(',', '')
        # Handle percentages
        if value.endswith('%'):
            try:
                return float(value.rstrip('%'))
            except ValueError:
                return value
        try:
            return float(value)
        except ValueError:
            return value
    return value