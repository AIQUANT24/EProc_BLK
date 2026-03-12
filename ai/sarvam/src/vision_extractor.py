

import os
import json
import zipfile
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from loguru import logger
from sarvamai import SarvamAI
from sarvamai.core.api_error import ApiError
from bs4 import BeautifulSoup 
import sys
import time
import re
import shutil  # Add this import

# Configure logger
logger.remove()
logger.add("../logs/doc_intelligence_{time}.log", rotation="500 MB", retention="10 days", level="DEBUG")
logger.add(sys.stdout, level="DEBUG")

# Load environment variables
load_dotenv()

class SarvamDocumentIntelligence:
    """
    A class to handle Sarvam AI Document Intelligence API operations
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize with API key
        """
        self.api_key = api_key or os.getenv('SARVAM_API_KEY')
        if not self.api_key:
            raise ValueError("API key is required. Set SARVAM_API_KEY in .env file")
        
        # Initialize the Sarvam client
        self.client = SarvamAI(api_subscription_key=self.api_key)
        logger.info("Sarvam Document Intelligence client initialized")
    
    def process_document(self, 
                        file_path: str, 
                        language: str = "en-IN", 
                        output_format: str = "html",
                        wait_timeout: int = 300) -> dict:
        """
        Process a document using Document Intelligence API
        
        Args:
            file_path: Path to the document (PNG, JPG, PDF, or ZIP)
            language: BCP-47 language code (e.g., "en-IN", "hi-IN")
            output_format: "html" or "md" (markdown)
            wait_timeout: Maximum seconds to wait for completion
            
        Returns:
            Dictionary with processing results and output path
        """
        try:
            # Step 1: Create a job
            logger.info(f"Creating Document Intelligence job for: {file_path}")
            job = self.client.document_intelligence.create_job(
                language=language,
                output_format=output_format
            )
            logger.info(f"Job created with ID: {job.job_id}")
            
            # Step 2: Upload the file
            logger.info("Uploading file...")
            job.upload_file(file_path)
            logger.info("File uploaded successfully")
            
            # Step 3: Start processing
            logger.info("Starting document processing...")
            job.start()
            
            # Step 4: Wait for completion with progress tracking
            logger.info("Waiting for job to complete...")
            start_time = time.time()
            
            while time.time() - start_time < wait_timeout:
                status = job.get_status()
                logger.debug(f"Job state: {status.job_state}")
                
                if status.job_state in ["Completed", "PartiallyCompleted", "Failed"]:
                    break
                    
                # Show progress if available
                if hasattr(status, 'page_metrics'):
                    metrics = status.page_metrics
                    logger.info(f"Progress: {metrics.get('pages_processed', 0)}/{metrics.get('total_pages', '?')} pages")
                
                time.sleep(5)  # Wait 5 seconds before checking again
            
            # Step 5: Get final status
            final_status = job.get_status()
            logger.info(f"Final: {final_status}")
            logger.info(f"Final job state: {final_status.job_state}")
            
            # Log page metrics
            if hasattr(final_status, 'page_metrics'):
                metrics = final_status.page_metrics
                logger.info(f"Pages: {metrics.get('pages_processed', 0)} processed, "
                          f"{metrics.get('pages_succeeded', 0)} succeeded, "
                          f"{metrics.get('pages_failed', 0)} failed")
            
            # Step 6: Download output if successful
            if final_status.job_state in ["Completed", "PartiallyCompleted"]:
                # Create output directory
                output_dir = Path("../output")
                output_dir.mkdir(exist_ok=True)
                
                # Generate timestamp for filenames
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                base_name = Path(file_path).stem
                
                # Download ZIP file
                zip_path = output_dir / f"{base_name}_{timestamp}.zip"
                logger.info(f"Downloading output to: {zip_path}")
                job.download_output(str(zip_path))
                
                # Extract and process the contents
                extracted_data = self._process_zip_output(zip_path, output_dir, base_name, timestamp)
                
                return {
                    "success": True,
                    "job_id": job.job_id,
                    "job_state": final_status.job_state,
                    "page_metrics": final_status.page_metrics if hasattr(final_status, 'page_metrics') else {},
                    "zip_path": str(zip_path),
                    "extracted_data": extracted_data
                }
            else:
                logger.error(f"Job failed with state: {final_status.job_state}")
                return {
                    "success": False,
                    "job_id": job.job_id,
                    "job_state": final_status.job_state,
                    "error": "Processing failed"
                }
                
        except ApiError as e:
            logger.error(f"API Error: {e.status_code} - {e.body}")
            return {"success": False, "error": f"API Error: {e}"}
        except FileNotFoundError:
            logger.error(f"File not found: {file_path}")
            return {"success": False, "error": "File not found"}
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {"success": False, "error": str(e)}
    
    
    def _process_zip_output(self,
                                zip_path: Path,
                                output_dir: Path,
                                base_name: str,
                                timestamp: str) -> dict:
            """
            Extracts the output ZIP, processes HTML/MD files inside it,
            converts the HTML to a structured JSON file, then deletes
            all temporary files (extracted folder + ZIP).
    
            Returns:
                dict with keys: html_files, markdown_files, json_representation
            """
            extracted_data = {
                "html_files": [],
                "markdown_files": [],
                "json_representation": None
            }
    
            try:
                # ── Extract the ZIP into a temporary folder ───────────────
                extract_dir = output_dir / f"{base_name}_{timestamp}_extracted"
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
                logger.info(f"Extracted ZIP to: {extract_dir}")
    
                # ── Discover HTML and Markdown files inside the ZIP ───────
                html_files = list(extract_dir.glob("**/*.html"))
                md_files = list(extract_dir.glob("**/*.md"))
    
                # ── Debug: Print and save raw HTML for manual inspection ──
                # This helps you verify what Sarvam actually returned
                # before any parsing happens. Remove this block in production.
                if html_files:
                    with open(html_files[0], 'r', encoding='utf-8') as f:
                        raw_html = f.read()
    
                    print("=" * 60)
                    print("RAW HTML OUTPUT (first 3000 chars):")
                    print("=" * 60)
                    print(raw_html[:3000])
    
                    # Save full HTML as a debug file you can open in browser
                    debug_path = output_dir / f"{base_name}_{timestamp}_debug.html"
                    with open(debug_path, 'w', encoding='utf-8') as f:
                        f.write(raw_html)
                    logger.info(f"Raw HTML saved for inspection: {debug_path}")
    
                # ── Store paths of discovered files ───────────────────────
                extracted_data["html_files"] = [str(f) for f in html_files]
                extracted_data["markdown_files"] = [str(f) for f in md_files]
    
                # ── Convert the first HTML file to structured JSON ────────
                if html_files:
                    json_output = self._convert_html_to_json(html_files[0])
                    if json_output:
                        json_path = output_dir / f"{base_name}_{timestamp}.json"
                        with open(json_path, 'w', encoding='utf-8') as f:
                            json.dump(json_output, f, indent=2, ensure_ascii=False)
                        extracted_data["json_representation"] = str(json_path)
                        logger.info(f"Structured JSON saved: {json_path}")
    
                # ── Cleanup: Delete the temp extracted folder ─────────────
                shutil.rmtree(extract_dir)
                logger.info(f"Deleted temporary folder: {extract_dir}")
    
                # ── Cleanup: Delete the original ZIP file ─────────────────
                zip_path.unlink()
                logger.info(f"Deleted ZIP file: {zip_path}")
    
                return extracted_data
    
            except Exception as e:
                logger.error(f"Error processing ZIP: {e}")
                return extracted_data  # Return whatever was collected before the error


    

    def _convert_html_to_json(self, html_path: Path) -> dict:
        """
        HTML to JSON conversion that:
        - Extracts table cells into internal key_value_pairs
        - Builds a clean, human-readable structured_tables view
        - Returns only structured_tables + headings/paragraphs/metadata
        """
        try:
            from bs4 import BeautifulSoup
            import re

            with open(html_path, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')

            # Replace <br> with explicit newlines in raw text
            for br in soup.find_all('br'):
                br.replace_with('\\n')

            # Internal container; we won't return all of this directly
            flat_kv: dict = {}

            result = {
                "structured_tables": {},
                "headings": [],
                "paragraphs": [],
                "metadata": {
                    "extraction_timestamp": datetime.now().isoformat(),
                    "source_file": html_path.name
                }
            }

            # 1. Headings
            for tag in soup.find_all(['h1', 'h2', 'h3', 'h4']):
                text = tag.get_text(strip=True)
                if text and text != "ProjectManager":
                    result["headings"].append({
                        "level": tag.name,
                        "text": text
                    })

            # 2. Tables → flat key_value_pairs (internal only)
            table_count = 0
            for table_idx, table in enumerate(soup.find_all('table'), 1):
                all_rows = table.find_all('tr')
                if not all_rows:
                    continue

                table_count += 1

                # 2.1 Detect header row (first non-empty row)
                header_row = None
                data_start_idx = 0
                for i, row in enumerate(all_rows):
                    cells = row.find_all(['th', 'td'])
                    if cells and any(cell.get_text(strip=True) for cell in cells):
                        header_row = row
                        data_start_idx = i + 1
                        break

                # 2.2 Extract headers text for this table
                headers = []
                if header_row:
                    header_cells = header_row.find_all(['th', 'td'])
                    headers = [self._clean_header(cell.get_text(strip=True)) for cell in header_cells]
                else:
                    first_row_cells = all_rows[0].find_all(['td', 'th']) if all_rows else []
                    headers = [f"col_{i+1}" for i in range(len(first_row_cells))]

                # 2.3 Data rows → internal flat_kv
                row_num = 0
                for row_idx in range(data_start_idx, len(all_rows)):
                    row = all_rows[row_idx]
                    cells = row.find_all(['td', 'th'])

                    if not cells or all(not cell.get_text(strip=True) for cell in cells):
                        continue

                    row_num += 1

                    for col_idx, cell in enumerate(cells):
                        header = headers[col_idx] if col_idx < len(headers) else f"col_{col_idx+1}"
                        raw_value = cell.get_text(strip=True)

                        # keep raw (with \n) separately if you ever need it
                        cleaned_value = re.sub(r'\\n+', ' ', raw_value).strip()

                        key = f"table_{table_count}_row_{row_num}_{header}"
                        flat_kv[key] = self._try_numeric(cleaned_value)
                        if raw_value != cleaned_value:
                            flat_kv[f"{key}_raw"] = raw_value

                # 2.4 Footer / totals row
                if all_rows:
                    last_row = all_rows[-1]
                    cells = last_row.find_all(['td', 'th'])
                    row_text = ' '.join(cell.get_text().lower() for cell in cells)

                    if 'total' in row_text or any('$' in cell.get_text() for cell in cells):
                        for col_idx, cell in enumerate(cells):
                            header = headers[col_idx] if col_idx < len(headers) else f"col_{col_idx+1}"
                            value = cell.get_text(strip=True)
                            key = f"table_{table_count}_footer_{header}"
                            flat_kv[key] = self._try_numeric(value)

            # 3. Paragraphs
            for p in soup.find_all('p'):
                text = p.get_text().strip()
                if text and len(text) > 10:
                    result["paragraphs"].append(text)

            # 4. Metadata
            result["metadata"].update({
                "num_tables_processed": table_count,
                "num_headings": len(result["headings"]),
                "num_paragraphs": len(result["paragraphs"])
            })

            # 5. Build clean, human-readable tables from internal flat_kv
            result["structured_tables"] = self._structure_tables_from_kv(flat_kv)

            return result

        except Exception as e:
            logger.error(f"HTML to JSON conversion error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "structured_tables": {},
                "headings": [],
                "paragraphs": [],
                "metadata": {"error": str(e)}
            }

    
    def _clean_header(self, header_text: str) -> str:
        """Clean header text for use as dictionary keys."""
        if not header_text:
            return "unnamed_column"

        cleaned = re.sub(r'[^\w\s\-]', ' ', header_text).strip()
        cleaned = re.sub(r'\s+', ' ', cleaned)

        if len(cleaned) > 50:
            cleaned = cleaned[:50]

        return cleaned if cleaned else "unnamed_column"

    
    def _structure_tables_from_kv(self, kv: dict) -> dict:
        """
        Convert internal flat table_X_row_Y_* keys into a clean structure:

        {
        "table_1": {
            "headers": [...],       # actual header labels
            "rows": [ {...}, ... ], # each row as dict with those headers
            "footer": {...}         # totals mapped to same headers
        }
        }

        - Row_1 is treated as header definition, not data.
        - *_raw keys are ignored.
        - Values are already numeric where possible, but '$' is preserved in _try_numeric.
        """
        tables: dict = {}

        for full_key, value in kv.items():
            # ignore raw variants here
            if not full_key.startswith("table_") or full_key.endswith("_raw"):
                continue

            parts = full_key.split("_", 3)
            if len(parts) < 4:
                continue

            table_tag, table_idx_str, section, rest = parts
            if not table_idx_str.isdigit():
                continue

            table_name = f"table_{table_idx_str}"
            tdata = tables.setdefault(table_name, {
                "rows_raw": {},   # row_index -> {col_key: value}
                "footer_raw": {}
            })

            if section == "row":
                row_parts = rest.split("_", 1)
                if len(row_parts) != 2:
                    continue
                row_idx_str, col_key = row_parts
                if not row_idx_str.isdigit():
                    continue
                row_idx = int(row_idx_str)
                row_dict = tdata["rows_raw"].setdefault(row_idx, {})
                row_dict[col_key] = value

            elif section == "footer":
                col_key = rest
                tdata["footer_raw"][col_key] = value

        # Build final structure
        structured = {}

        for table_name, tdata in tables.items():
            rows_raw = tdata["rows_raw"]
            footer_raw = tdata["footer_raw"]

            if not rows_raw:
                continue

            # 1) Build header_map from row_1 (table header row)
            if 1 in rows_raw:
                header_row = rows_raw[1]
                header_map = {col_key: header_row[col_key] for col_key in header_row.keys()}
                # remove header row from data rows
                rows_data = {idx: r for idx, r in rows_raw.items() if idx != 1}
            else:
                # fallback: use column keys as labels
                first_idx = min(rows_raw.keys())
                header_row = rows_raw[first_idx]
                header_map = {col_key: col_key for col_key in header_row.keys()}
                rows_data = rows_raw

            # 2) Order column keys in a stable way
            col_keys = list(header_map.keys())

            # 3) Build headers list (labels only)
            headers = [header_map[col_key] for col_key in col_keys]

            # 4) Build row objects using those headers
            rows = []
            for row_idx in sorted(rows_data.keys()):
                row_src = rows_data[row_idx]
                row_obj = {}
                for col_key in col_keys:
                    label = header_map[col_key]
                    row_obj[label] = row_src.get(col_key, "")
                rows.append(row_obj)

            # 5) Build footer mapped to same headers
            footer = {}
            if footer_raw:
                for col_key in col_keys:
                    label = header_map[col_key]
                    footer[label] = footer_raw.get(col_key, "")

            structured[table_name] = {
                "headers": headers,
                "rows": rows,
                "footer": footer
            }

        return structured



    
    
    def _try_numeric(self, value: str):
        """
        Convert to number if it's a plain numeric string.
        If it contains a currency symbol, leave it as string so '$' is preserved.
        """
        if not value or not isinstance(value, str):
            return value

        value = value.strip()
        if value == "":
            return value

        # If it has a currency symbol, keep as-is (e.g. "$3.50")
        if any(sym in value for sym in ["$", "£", "€", "₹"]):
            return value

        cleaned = value.replace(',', '').strip()

        try:
            if '.' in cleaned:
                return float(cleaned)
            else:
                return int(cleaned)
        except ValueError:
            if value.endswith('%'):
                try:
                    return float(value.rstrip('%'))
                except Exception:
                    return value
            return value
