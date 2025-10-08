#!/usr/bin/env python3
"""
LlamaParse PDF Parser for CVGenix
Uses LlamaParse for PDF text extraction and markdown formatting
"""

import sys
import json
import os
import traceback

def parse_with_llamaparse(pdf_path, output_format='markdown', extract_fields=None, json_schema=None, processing_mode='llm'):
    """Parse PDF using LlamaParse library with proper API"""
    try:
        from llama_cloud_services import LlamaParse
        
        # Get API key from environment variable
        api_key = os.getenv('LLAMA_CLOUD_API_KEY')
        if not api_key:
            return {"success": False, "error": "LLAMA_CLOUD_API_KEY environment variable not set"}
        
        # Create parser with configuration optimized for resume parsing
        parser = LlamaParse(
            api_key=api_key,
            parse_mode="parse_page_with_llm",  # Use LLM for better text understanding
            high_res_ocr=False,  # Disable high-res OCR to avoid spacing issues
            adaptive_long_table=False,  # Disable table extraction for resumes
            outlined_table_extraction=False,  # Disable table extraction
            output_tables_as_HTML=False,  # Disable HTML table output
            target_pages="0-1",  # Parse first 2 pages by default
            page_separator="\n\n",  # Simpler page separator
        )
        
        print(f"Using LlamaParse with {processing_mode} mode (optimized for resumes)", file=sys.stderr)
        
        # Suppress LlamaParse's stdout output to avoid interfering with JSON output
        import io
        import contextlib
        
        # Redirect stdout temporarily to capture LlamaParse's output
        old_stdout = sys.stdout
        sys.stdout = io.StringIO()
        
        try:
            # Parse the document
            result = parser.parse(pdf_path)
        finally:
            # Restore stdout
            sys.stdout = old_stdout
        
        # Get different output formats based on request
        extracted_text = ""
        markdown_text = ""
        html_text = ""
        csv_text = ""
        json_data = {}
        
        # Get markdown documents (always available)
        try:
            markdown_documents = result.get_markdown_documents(split_by_page=True)
            if markdown_documents:
                markdown_text = "\n\n".join([doc.text for doc in markdown_documents])
                extracted_text = markdown_text  # Default to markdown
            else:
                # Fallback to text documents
                text_documents = result.get_text_documents(split_by_page=False)
                if text_documents:
                    extracted_text = "\n\n".join([doc.text for doc in text_documents])
                    markdown_text = extracted_text
                else:
                    extracted_text = "No content extracted"
                    markdown_text = extracted_text
        except Exception as e:
            print(f"Error getting markdown: {e}", file=sys.stderr)
            extracted_text = "Error extracting content"
            markdown_text = extracted_text
        
        # Get other formats if requested
        if output_format == 'html':
            try:
                # Try to get HTML from markdown or use text documents
                if markdown_documents:
                    # Convert markdown to HTML (basic conversion)
                    html_text = f"<html><body><pre>{markdown_text}</pre></body></html>"
                else:
                    html_text = f"<html><body><pre>{extracted_text}</pre></body></html>"
                extracted_text = html_text
            except Exception as e:
                html_text = f"<html><body><pre>{extracted_text}</pre></body></html>"
                extracted_text = html_text
        
        elif output_format == 'csv':
            try:
                # Basic CSV conversion
                lines = extracted_text.split('\n')
                csv_lines = ['Field,Value']
                for i, line in enumerate(lines):
                    if line.strip():
                        csv_lines.append(f'Line_{i+1},"{line.replace('"', '""')}"')
                csv_text = '\n'.join(csv_lines)
                extracted_text = csv_text
            except Exception as e:
                csv_text = "Field,Value\nContent," + extracted_text.replace('"', '""')
                extracted_text = csv_text
        
        elif output_format == 'json':
            try:
                # Create structured JSON from the content
                json_data = {
                    "content": extracted_text,
                    "format": "text",
                    "source": "llamaparse",
                    "pages": len(markdown_documents) if markdown_documents else 1
                }
                
                # Add structured data if available
                if hasattr(result, 'pages') and result.pages:
                    structured_data = []
                    for page in result.pages:
                        if hasattr(page, 'structuredData') and page.structuredData:
                            structured_data.append(page.structuredData)
                    if structured_data:
                        json_data["structured_data"] = structured_data
                
                extracted_text = json.dumps(json_data, indent=2)
            except Exception as e:
                # Fallback to basic JSON structure
                json_data = {
                    "content": extracted_text,
                    "format": "text",
                    "error": str(e)
                }
                extracted_text = json.dumps(json_data, indent=2)
        
        # Try to get page count from result
        page_count = 1
        if hasattr(result, 'pages') and result.pages:
            page_count = len(result.pages)
        elif markdown_documents:
            page_count = len(markdown_documents)
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
            "method": f"llamaparse-{processing_mode}",
            "library": "LlamaParse",
            "output_format": output_format,
            "processing_mode": processing_mode
        }
        
    except ImportError:
        return {"success": False, "error": "LlamaParse not properly installed"}
    except Exception as e:
        return {"success": False, "error": f"LlamaParse error: {str(e)}"}

async def parse_with_llamaparse_async(pdf_path, output_format='markdown', extract_fields=None, json_schema=None, processing_mode='llm'):
    """Async version of LlamaParse parsing"""
    try:
        from llama_cloud_services import LlamaParse
        
        # Get API key from environment variable
        api_key = os.getenv('LLAMA_CLOUD_API_KEY')
        if not api_key:
            return {"success": False, "error": "LLAMA_CLOUD_API_KEY environment variable not set"}
        
        # Create parser with configuration optimized for resume parsing
        parser = LlamaParse(
            api_key=api_key,
            parse_mode="parse_page_with_llm",  # Use LLM for better text understanding
            high_res_ocr=False,  # Disable high-res OCR to avoid spacing issues
            adaptive_long_table=False,  # Disable table extraction for resumes
            outlined_table_extraction=False,  # Disable table extraction
            output_tables_as_HTML=False,  # Disable HTML table output
            target_pages="0-1",  # Parse first 2 pages by default
            page_separator="\n\n",  # Simpler page separator
        )
        
        print(f"Using LlamaParse async with {processing_mode} mode (optimized for resumes)", file=sys.stderr)
        
        # Suppress LlamaParse's stdout output to avoid interfering with JSON output
        import io
        import contextlib
        
        # Redirect stdout temporarily to capture LlamaParse's output
        old_stdout = sys.stdout
        sys.stdout = io.StringIO()
        
        try:
            # Parse the document asynchronously
            result = await parser.aparse(pdf_path)
        finally:
            # Restore stdout
            sys.stdout = old_stdout
        
        # Get different output formats based on request
        extracted_text = ""
        markdown_text = ""
        html_text = ""
        csv_text = ""
        json_data = {}
        
        # Get markdown documents (always available)
        try:
            markdown_documents = result.get_markdown_documents(split_by_page=True)
            if markdown_documents:
                markdown_text = "\n\n".join([doc.text for doc in markdown_documents])
                extracted_text = markdown_text  # Default to markdown
            else:
                # Fallback to text documents
                text_documents = result.get_text_documents(split_by_page=False)
                if text_documents:
                    extracted_text = "\n\n".join([doc.text for doc in text_documents])
                    markdown_text = extracted_text
                else:
                    extracted_text = "No content extracted"
                    markdown_text = extracted_text
        except Exception as e:
            print(f"Error getting markdown: {e}", file=sys.stderr)
            extracted_text = "Error extracting content"
            markdown_text = extracted_text
        
        # Get other formats if requested (same logic as sync version)
        if output_format == 'html':
            try:
                if markdown_documents:
                    html_text = f"<html><body><pre>{markdown_text}</pre></body></html>"
                else:
                    html_text = f"<html><body><pre>{extracted_text}</pre></body></html>"
                extracted_text = html_text
            except Exception as e:
                html_text = f"<html><body><pre>{extracted_text}</pre></body></html>"
                extracted_text = html_text
        
        elif output_format == 'csv':
            try:
                lines = extracted_text.split('\n')
                csv_lines = ['Field,Value']
                for i, line in enumerate(lines):
                    if line.strip():
                        csv_lines.append(f'Line_{i+1},"{line.replace('"', '""')}"')
                csv_text = '\n'.join(csv_lines)
                extracted_text = csv_text
            except Exception as e:
                csv_text = "Field,Value\nContent," + extracted_text.replace('"', '""')
                extracted_text = csv_text
        
        elif output_format == 'json':
            try:
                json_data = {
                    "content": extracted_text,
                    "format": "text",
                    "source": "llamaparse",
                    "pages": len(markdown_documents) if markdown_documents else 1
                }
                
                if hasattr(result, 'pages') and result.pages:
                    structured_data = []
                    for page in result.pages:
                        if hasattr(page, 'structuredData') and page.structuredData:
                            structured_data.append(page.structuredData)
                    if structured_data:
                        json_data["structured_data"] = structured_data
                
                extracted_text = json.dumps(json_data, indent=2)
            except Exception as e:
                json_data = {
                    "content": extracted_text,
                    "format": "text",
                    "error": str(e)
                }
                extracted_text = json.dumps(json_data, indent=2)
        
        # Try to get page count from result
        page_count = 1
        if hasattr(result, 'pages') and result.pages:
            page_count = len(result.pages)
        elif markdown_documents:
            page_count = len(markdown_documents)
        else:
            page_count = max(1, len(extracted_text) // 1500)
        
        return {
            "success": True,
            "text": extracted_text.strip(),
            "markdown": markdown_text.strip(),
            "html": html_text.strip() if html_text else "",
            "csv": csv_text.strip() if csv_text else "",
            "json": json_data if json_data else {},
            "page_count": page_count,
            "method": f"llamaparse-{processing_mode}",
            "library": "LlamaParse",
            "output_format": output_format,
            "processing_mode": processing_mode
        }
        
    except ImportError:
        return {"success": False, "error": "LlamaParse not properly installed"}
    except Exception as e:
        return {"success": False, "error": f"LlamaParse error: {str(e)}"}


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python llamaparseParser.py <pdf_path> [output_format] [extract_fields] [json_schema] [processing_mode]"
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_format = sys.argv[2] if len(sys.argv) > 2 else 'markdown'
    extract_fields = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] else None
    json_schema_str = sys.argv[4] if len(sys.argv) > 4 else None
    processing_mode = sys.argv[5] if len(sys.argv) > 5 else 'llm'
    
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
        # Parse with LlamaParse
        result = parse_with_llamaparse(pdf_path, output_format, extract_fields, json_schema, processing_mode)
        
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
            
            # Use LlamaParse output directly - it's already clean
            cleaned_text = main_text
            markdown_text = result["markdown"] if result["markdown"] else main_text
            
            word_count = len(cleaned_text.split()) if cleaned_text else 0
            char_count = len(cleaned_text) if cleaned_text else 0
            
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
                "method": f"llamaparse-{result['method']}",
                "library": result["library"],
                "outputFormat": result["output_format"],
                "processingMode": result["processing_mode"],
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
