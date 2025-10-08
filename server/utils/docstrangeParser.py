#!/usr/bin/env python3
"""
DocStrange PDF Parser for CVGenix
Uses only DocStrange for PDF text extraction and markdown formatting
"""

import sys
import json
import os
import traceback
from pathlib import Path

def parse_with_docstrange(pdf_path, output_format='markdown', extract_fields=None, json_schema=None, processing_mode='gpu'):
    """Parse PDF using DocStrange library with proper API"""
    try:
        from docstrange import DocumentExtractor
        
        # Create extractor with proper configuration based on processing mode
        if processing_mode == 'gpu':
            try:
                # Try true local GPU processing first
                extractor = DocumentExtractor(gpu=True)
                print("Using true local GPU processing", file=sys.stderr)
            except Exception as gpu_error:
                # If GPU mode fails, fall back to CPU mode
                print(f"GPU mode failed: {gpu_error}", file=sys.stderr)
                print("Falling back to CPU mode...", file=sys.stderr)
                try:
                    # Try true local CPU processing
                    extractor = DocumentExtractor(cpu=True)
                    print("Using true local CPU processing", file=sys.stderr)
                    processing_mode = 'cpu'  # Update mode for response
                except Exception as cpu_error:
                    # If CPU mode fails, try basic local processing
                    print(f"Neural CPU mode failed: {cpu_error}", file=sys.stderr)
                    print("Trying basic local processing...", file=sys.stderr)
                    try:
                        # Try basic local processing without heavy dependencies
                        extractor = DocumentExtractor()
                        # Force local processing without neural models
                        extractor.cloud_mode = False
                        print("Using basic local CPU processing", file=sys.stderr)
                        processing_mode = 'cpu'  # Update mode for response
                    except Exception as basic_error:
                        # If basic local fails, this is an error
                        print(f"Basic local processing failed: {basic_error}", file=sys.stderr)
                        return {"success": False, "error": f"Local processing failed: {basic_error}"}
        elif processing_mode == 'cpu':
            try:
                # Try true local CPU processing first
                extractor = DocumentExtractor(cpu=True)
                print("Using true local CPU processing", file=sys.stderr)
            except Exception as cpu_error:
                # If CPU mode fails, try basic local processing without neural models
                print(f"Neural CPU mode failed: {cpu_error}", file=sys.stderr)
                print("Trying basic local processing...", file=sys.stderr)
                try:
                    # Try basic local processing without heavy dependencies
                    extractor = DocumentExtractor()
                    # Force local processing without neural models
                    extractor.cloud_mode = False
                    print("Using basic local CPU processing", file=sys.stderr)
                except Exception as basic_error:
                    # If basic local fails, this is an error
                    print(f"Basic local processing failed: {basic_error}", file=sys.stderr)
                    return {"success": False, "error": f"Local processing failed: {basic_error}"}
        else:  # fallback to CPU mode
            print("Invalid processing mode, falling back to CPU mode", file=sys.stderr)
            try:
                # Try true local CPU processing first
                extractor = DocumentExtractor(cpu=True)
                print("Using true local CPU processing", file=sys.stderr)
            except Exception as cpu_error:
                # If CPU mode fails, try basic local processing without neural models
                print(f"Neural CPU mode failed: {cpu_error}", file=sys.stderr)
                print("Trying basic local processing...", file=sys.stderr)
                try:
                    # Try basic local processing without heavy dependencies
                    extractor = DocumentExtractor()
                    # Force local processing without neural models
                    extractor.cloud_mode = False
                    print("Using basic local CPU processing", file=sys.stderr)
                except Exception as basic_error:
                    # If basic local fails, this is an error
                    print(f"Basic local processing failed: {basic_error}", file=sys.stderr)
                    return {"success": False, "error": f"Local processing failed: {basic_error}"}
            processing_mode = 'cpu'  # Update mode for response
        
        # Extract using the main extract method
        result = extractor.extract(pdf_path)
        
        # Get different output formats based on request
        extracted_text = ""
        markdown_text = ""
        html_text = ""
        csv_text = ""
        json_data = {}
        
        # Get markdown (always available)
        try:
            markdown_text = result.extract_markdown()
            extracted_text = markdown_text  # Default to markdown
        except Exception as e:
            extracted_text = str(result)
            markdown_text = extracted_text
        
        # Get other formats if requested
        if output_format == 'html':
            try:
                html_text = result.extract_html()
                extracted_text = html_text
            except Exception as e:
                html_text = f"<html><body><pre>{extracted_text}</pre></body></html>"
                extracted_text = html_text
        
        elif output_format == 'csv':
            try:
                csv_text = result.extract_csv()
                extracted_text = csv_text
            except Exception as e:
                csv_text = "Field,Value\nContent," + extracted_text.replace('"', '""')
                extracted_text = csv_text
        
        elif output_format == 'json':
            try:
                if extract_fields:
                    # Extract specific fields
                    json_data = result.extract_data(specified_fields=extract_fields)
                elif json_schema:
                    # Extract with JSON schema
                    json_data = result.extract_data(json_schema=json_schema)
                else:
                    # Extract all data as JSON
                    json_data = result.extract_data()
                extracted_text = str(json_data)
            except Exception as e:
                # Fallback to basic JSON structure
                json_data = {
                    "content": extracted_text,
                    "format": "text",
                    "error": str(e)
                }
                extracted_text = str(json_data)
        
        # Try to get page count from result if available
        page_count = 1
        if hasattr(result, 'page_count'):
            page_count = result.page_count
        elif hasattr(result, 'pages'):
            page_count = len(result.pages) if result.pages else 1
        else:
            # Estimate page count based on text length
            page_count = max(1, len(extracted_text) // 1500)
        
        return {
            "success": True,
            "text": extracted_text.strip(),
            "markdown": markdown_text.strip(),
            "html": html_text.strip() if html_text else "",
            "csv": csv_text.strip() if csv_text else "",
            "json": json_data if json_data else {},
            "page_count": page_count,
            "method": f"docstrange-{processing_mode}",
            "library": "DocStrange",
            "output_format": output_format,
            "processing_mode": processing_mode
        }
        
    except ImportError:
        return {"success": False, "error": "DocStrange not properly installed"}
    except Exception as e:
        return {"success": False, "error": f"DocStrange error: {str(e)}"}

def clean_text(text):
    """Clean and normalize extracted text - minimal cleaning to preserve formatting"""
    if not text:
        return text
    
    import re
    
    # Only do minimal cleaning - preserve the original formatting
    # Fix multiple spaces to single space, but preserve line breaks
    text = re.sub(r'[ \t]+', ' ', text)  # multiple spaces/tabs to single space
    text = re.sub(r'\n\s*\n', '\n\n', text)  # multiple newlines to double
    
    return text.strip()

def format_as_markdown(text):
    """Convert extracted text to markdown format with headers"""
    if not text:
        return text
    
    import re
    
    # If text is already in markdown format, return as is
    if text.startswith('#') or '##' in text:
        return text
    
    markdown_lines = ['# Resume/CV Document\n']
    
    # First, try to split the text into logical sections
    text = re.sub(r'(?i)(TECHNICAL SKILLS|PROFESSIONAL EXPERIENCE|EDUCATION|ACADEMIC CREDENTIALS|HONOURS AND AWARDS)', r'\n\n## \1\n', text)
    
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('## '):
            markdown_lines.append(f'\n{line}\n')
        elif re.search(r'@|linkedin|phone|\+1|\+[0-9]|\.com|\.ca', line.lower()):
            markdown_lines.append(f'**{line}**')
        elif re.search(r'(?i)(developer|engineer|manager|analyst|consultant|specialist|coordinator|director|lead|senior|junior|full\s+stack)', line) and ('|' in line or 'at' in line.lower() or 'company' in line.lower() or 'clients' in line.lower()):
            markdown_lines.append(f'### {line}')
        elif re.search(r'\b(20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current)\b', line.lower()):
            markdown_lines.append(f'*{line}*')
        elif line.startswith(('•', '-', '*', '◦')):
            markdown_lines.append(f'- {line[1:].strip()}')
        elif re.search(r'(?i)(php|javascript|react|node|python|java|sql|html|css|laravel|bootstrap|mysql|mongodb|aws|docker|kubernetes)', line.lower()):
            markdown_lines.append(f'- {line}')
        else:
            markdown_lines.append(line)
    
    markdown_text = '\n'.join(markdown_lines)
    markdown_text = re.sub(r'\n{3,}', '\n\n', markdown_text)
    
    return markdown_text.strip()

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python docstrangeParser.py <pdf_path> [output_format] [extract_fields] [json_schema] [processing_mode]"
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_format = sys.argv[2] if len(sys.argv) > 2 else 'markdown'
    extract_fields = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] else None
    json_schema_str = sys.argv[4] if len(sys.argv) > 4 else None
    processing_mode = sys.argv[5] if len(sys.argv) > 5 else 'gpu'
    
    # Parse JSON schema if provided
    json_schema = None
    if json_schema_str:
        try:
            json_schema = json.loads(json_schema_str)
        except json.JSONDecodeError:
            print(json.dumps({
                "success": False,
                "error": "Invalid JSON schema format"
            }))
            sys.exit(1)
    
    if not os.path.exists(pdf_path):
        print(json.dumps({
            "success": False,
            "error": f"PDF file not found: {pdf_path}"
        }))
        sys.exit(1)
    
    try:
        # Parse with DocStrange
        result = parse_with_docstrange(pdf_path, output_format, extract_fields, json_schema, processing_mode)
        
        if result["success"]:
            # Use the appropriate text based on output format
            if output_format == 'html':
                main_text = result["html"]
            elif output_format == 'csv':
                main_text = result["csv"]
            elif output_format == 'json':
                main_text = result["text"]  # JSON string
            else:
                main_text = result["text"]  # markdown or text
            
            # Clean text for word/character counting
            cleaned_text = clean_text(main_text)
            
            # Use markdown for display formatting and clean it
            raw_markdown = result["markdown"] if result["markdown"] else format_as_markdown(cleaned_text)
            markdown_text = clean_text(raw_markdown)
            
            word_count = len(cleaned_text.split()) if cleaned_text else 0
            char_count = len(cleaned_text) if cleaned_text else 0
            
            # Calculate better confidence score
            confidence = 85  # Base confidence for DocStrange cloud
            if word_count > 500:
                confidence = min(95, confidence + 5)
            if word_count > 1000:
                confidence = min(95, confidence + 5)
            if result["page_count"] > 1:
                confidence = min(95, confidence + 3)
            
            final_result = {
                "success": True,
                "extractedText": cleaned_text,
                "markdownText": markdown_text,
                "htmlText": result["html"] if result["html"] else "",
                "csvText": result["csv"] if result["csv"] else "",
                "jsonData": result["json"] if result["json"] else {},
                "pageCount": result["page_count"],
                "wordCount": word_count,
                "characterCount": char_count,
                "method": f"docstrange-{result['method']}",
                "library": result["library"],
                "outputFormat": result["output_format"],
                "processingMode": result["processing_mode"],
                "confidence": confidence,
                "processingTime": 0
            }
            
            print(json.dumps(final_result))
        else:
            print(json.dumps({
                "success": False,
                "error": result["error"]
            }))
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "traceback": traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
