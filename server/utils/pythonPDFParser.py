#!/usr/bin/env python3
"""
Python-based PDF Parser for CVGenix
Supports multiple Python PDF parsing libraries for comprehensive text extraction
"""

import sys
import json
import os
import traceback
from pathlib import Path

def parse_with_pypdf2(pdf_path):
    """Parse PDF using PyPDF2 library"""
    try:
        import PyPDF2
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            page_count = len(pdf_reader.pages)
            
            for page_num in range(page_count):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
            
            return {
                "success": True,
                "text": text.strip(),
                "page_count": page_count,
                "method": "pypdf2",
                "library": "PyPDF2"
            }
    except ImportError:
        return {"success": False, "error": "PyPDF2 not installed"}
    except Exception as e:
        return {"success": False, "error": f"PyPDF2 error: {str(e)}"}

def parse_with_pymupdf_advanced(pdf_path):
    """Parse PDF using PyMuPDF with advanced text extraction"""
    try:
        import fitz  # PyMuPDF
        
        doc = fitz.open(pdf_path)
        text = ""
        page_count = doc.page_count
        
        for page_num in range(page_count):
            page = doc[page_num]
            # Try different text extraction methods
            text_dict = page.get_text("dict")
            blocks = text_dict.get("blocks", [])
            
            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            text += span["text"] + " "
                        text += "\n"
        
        doc.close()
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": page_count,
            "method": "pymupdf_advanced",
            "library": "PyMuPDF Advanced"
        }
    except ImportError:
        return {"success": False, "error": "PyMuPDF not installed"}
    except Exception as e:
        return {"success": False, "error": f"PyMuPDF Advanced error: {str(e)}"}

def parse_with_pdfplumber_advanced(pdf_path):
    """Parse PDF using pdfplumber with advanced extraction"""
    try:
        import pdfplumber
        
        text = ""
        page_count = 0
        
        with pdfplumber.open(pdf_path) as pdf:
            page_count = len(pdf.pages)
            
            for page in pdf.pages:
                # Extract text with layout preservation
                page_text = page.extract_text(layout=True)
                if page_text:
                    text += page_text + "\n"
                
                # Also try extracting tables and other elements
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if row:
                            text += " ".join([cell or "" for cell in row]) + "\n"
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": page_count,
            "method": "pdfplumber_advanced",
            "library": "pdfplumber Advanced"
        }
    except ImportError:
        return {"success": False, "error": "pdfplumber not installed"}
    except Exception as e:
        return {"success": False, "error": f"pdfplumber Advanced error: {str(e)}"}

def parse_with_pdfminer_advanced(pdf_path):
    """Parse PDF using pdfminer with advanced layout analysis"""
    try:
        from pdfminer.high_level import extract_text
        from pdfminer.pdfpage import PDFPage
        from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
        from pdfminer.converter import TextConverter
        from pdfminer.layout import LAParams
        from io import StringIO
        
        # Count pages
        with open(pdf_path, 'rb') as file:
            page_count = len(list(PDFPage.get_pages(file)))
        
        # Extract text with layout analysis
        laparams = LAParams(
            word_margin=0.1,
            char_margin=2.0,
            line_margin=0.5,
            boxes_flow=0.5
        )
        
        text = extract_text(pdf_path, laparams=laparams)
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": page_count,
            "method": "pdfminer_advanced",
            "library": "pdfminer Advanced"
        }
    except ImportError:
        return {"success": False, "error": "pdfminer not installed"}
    except Exception as e:
        return {"success": False, "error": f"pdfminer Advanced error: {str(e)}"}

def parse_with_pdfquery(pdf_path):
    """Parse PDF using pdfquery library"""
    try:
        import pdfquery
        
        pdf = pdfquery.PDFQuery(pdf_path)
        pdf.load()
        
        # Extract text using different selectors
        text = ""
        page_count = len(pdf.pq('LTPage'))
        
        for page_num in range(page_count):
            page_text = pdf.pq(f'LTPage[pageid="{page_num + 1}"]').text()
            text += page_text + "\n"
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": page_count,
            "method": "pdfquery",
            "library": "pdfquery"
        }
    except ImportError:
        return {"success": False, "error": "pdfquery not installed"}
    except Exception as e:
        return {"success": False, "error": f"pdfquery error: {str(e)}"}

def parse_with_tabula_py(pdf_path):
    """Parse PDF using tabula-py for table extraction"""
    try:
        import tabula
        
        # Extract tables from PDF
        tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
        
        text = ""
        page_count = 0
        
        if tables:
            for i, table in enumerate(tables):
                if not table.empty:
                    text += f"Table {i + 1}:\n"
                    text += table.to_string() + "\n\n"
        
        # Also try to extract text using tabula's text extraction
        try:
            text_data = tabula.read_pdf(pdf_path, pages='all', output_format='json')
            if text_data:
                for page_data in text_data:
                    if 'data' in page_data:
                        for row in page_data['data']:
                            if row:
                                text += " ".join([str(cell) for cell in row if cell]) + "\n"
        except:
            pass
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": len(tables) if tables else 1,
            "method": "tabula_py",
            "library": "tabula-py"
        }
    except ImportError:
        return {"success": False, "error": "tabula-py not installed"}
    except Exception as e:
        return {"success": False, "error": f"tabula-py error: {str(e)}"}

def parse_with_camelot(pdf_path):
    """Parse PDF using camelot-py for advanced table extraction"""
    try:
        import camelot
        
        # Extract tables using camelot
        tables = camelot.read_pdf(pdf_path, pages='all')
        
        text = ""
        page_count = 0
        
        if tables:
            for i, table in enumerate(tables):
                if not table.df.empty:
                    text += f"Table {i + 1}:\n"
                    text += table.df.to_string() + "\n\n"
                    page_count = max(page_count, table.page)
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": page_count,
            "method": "camelot",
            "library": "camelot-py"
        }
    except ImportError:
        return {"success": False, "error": "camelot-py not installed"}
    except Exception as e:
        return {"success": False, "error": f"camelot-py error: {str(e)}"}

def parse_with_pdfkit(pdf_path):
    """Parse PDF using pdfkit (requires wkhtmltopdf)"""
    try:
        import pdfkit
        import subprocess
        import tempfile
        import os
        
        # Convert PDF to HTML first, then extract text
        with tempfile.NamedTemporaryFile(suffix='.html', delete=False) as temp_html:
            temp_html_path = temp_html.name
        
        try:
            # Use pdftohtml if available
            result = subprocess.run(['pdftohtml', '-s', '-noframes', pdf_path, temp_html_path], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0 and os.path.exists(temp_html_path):
                with open(temp_html_path, 'r', encoding='utf-8') as f:
                    html_content = f.read()
                
                # Simple HTML to text conversion
                import re
                text = re.sub(r'<[^>]+>', '', html_content)
                text = re.sub(r'\s+', ' ', text)
                
                return {
                    "success": True,
                    "text": text.strip(),
                    "page_count": 1,  # Hard to determine from HTML
                    "method": "pdfkit",
                    "library": "pdfkit"
                }
            else:
                return {"success": False, "error": "pdftohtml not available"}
        finally:
            if os.path.exists(temp_html_path):
                os.unlink(temp_html_path)
                
    except ImportError:
        return {"success": False, "error": "pdfkit not installed"}
    except Exception as e:
        return {"success": False, "error": f"pdfkit error: {str(e)}"}

def parse_with_pdfplumber(pdf_path):
    """Parse PDF using pdfplumber library"""
    try:
        import pdfplumber
        
        text = ""
        page_count = 0
        
        with pdfplumber.open(pdf_path) as pdf:
            page_count = len(pdf.pages)
            
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": page_count,
            "method": "pdfplumber",
            "library": "pdfplumber"
        }
    except ImportError:
        return {"success": False, "error": "pdfplumber not installed"}
    except Exception as e:
        return {"success": False, "error": f"pdfplumber error: {str(e)}"}

def parse_with_pymupdf(pdf_path):
    """Parse PDF using PyMuPDF (fitz) library"""
    try:
        import fitz  # PyMuPDF
        
        doc = fitz.open(pdf_path)
        text = ""
        page_count = doc.page_count
        
        for page_num in range(page_count):
            page = doc[page_num]
            text += page.get_text() + "\n"
        
        doc.close()
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": page_count,
            "method": "pymupdf",
            "library": "PyMuPDF"
        }
    except ImportError:
        return {"success": False, "error": "PyMuPDF not installed"}
    except Exception as e:
        return {"success": False, "error": f"PyMuPDF error: {str(e)}"}

def parse_with_pdfminer(pdf_path):
    """Parse PDF using pdfminer library"""
    try:
        from pdfminer.high_level import extract_text
        from pdfminer.pdfpage import PDFPage
        from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
        from pdfminer.converter import TextConverter
        from pdfminer.layout import LAParams
        from io import StringIO
        
        # Count pages
        with open(pdf_path, 'rb') as file:
            page_count = len(list(PDFPage.get_pages(file)))
        
        # Extract text
        text = extract_text(pdf_path)
        
        return {
            "success": True,
            "text": text.strip(),
            "page_count": page_count,
            "method": "pdfminer",
            "library": "pdfminer"
        }
    except ImportError:
        return {"success": False, "error": "pdfminer not installed"}
    except Exception as e:
        return {"success": False, "error": f"pdfminer error: {str(e)}"}

def parse_with_llamaparse_local(pdf_path):
    """Parse PDF using LlamaParse local processing"""
    try:
        # Try to use LlamaParse library directly
        from llama_cloud_services import LlamaParse
        import os
        
        # Get API key from environment variable
        api_key = os.getenv('LLAMA_CLOUD_API_KEY')
        if not api_key:
            return {"success": False, "error": "LLAMA_CLOUD_API_KEY environment variable not set"}
        
        # Create parser with configuration
        parser = LlamaParse(
            api_key=api_key,
            parse_mode="parse_page_with_llm",
            high_res_ocr=True,
            adaptive_long_table=True,
            outlined_table_extraction=True,
            output_tables_as_HTML=True,
            target_pages="0-1",  # Parse first 2 pages by default
            page_separator="\n\n---\n\n",
        )
        
        # Parse the document
        result = parser.parse(pdf_path)
        
        # Get markdown documents
        markdown_documents = result.get_markdown_documents(split_by_page=True)
        if markdown_documents:
            markdown_text = "\n\n".join([doc.text for doc in markdown_documents])
            page_count = len(markdown_documents)
        else:
            # Fallback to text documents
            text_documents = result.get_text_documents(split_by_page=False)
            if text_documents:
                markdown_text = "\n\n".join([doc.text for doc in text_documents])
                page_count = 1
            else:
                markdown_text = "No content extracted"
                page_count = 1
        
        return {
            "success": True,
            "text": markdown_text.strip(),
            "page_count": page_count,
            "method": "llamaparse_local",
            "library": "LlamaParse Local"
        }
        
    except ImportError:
        return {"success": False, "error": "LlamaParse not properly installed"}
    except Exception as e:
        return {"success": False, "error": f"LlamaParse error: {str(e)}"}

def clean_text(text):
    """Clean and normalize extracted text"""
    if not text:
        return text
    
    # Remove excessive whitespace
    import re
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    # Fix common PDF extraction issues
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # Add space between camelCase
    text = re.sub(r'([.!?])([A-Z])', r'\1 \2', text)  # Add space after sentences
    
    return text.strip()

def format_as_markdown(text):
    """Convert extracted text to markdown format with headers"""
    if not text:
        return text
    
    import re
    
    # Add a header for the document
    markdown_lines = ['# Resume/CV Document\n']
    
    # First, try to split the text into logical sections
    # Look for common section separators
    text = re.sub(r'(?i)(TECHNICAL SKILLS|PROFESSIONAL EXPERIENCE|EDUCATION|ACADEMIC CREDENTIALS|HONOURS AND AWARDS)', r'\n\n## \1\n', text)
    
    # Split text into lines and process
    lines = text.split('\n')
    
    # Process each line
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Section headers
        if line.startswith('## '):
            markdown_lines.append(f'\n{line}\n')
        # Contact information (emails, phone, LinkedIn)
        elif re.search(r'@|linkedin|phone|\+1|\+[0-9]|\.com|\.ca', line.lower()):
            markdown_lines.append(f'**{line}**')
        # Job titles with company
        elif re.search(r'(?i)(developer|engineer|manager|analyst|consultant|specialist|coordinator|director|lead|senior|junior|full\s+stack)', line) and ('|' in line or 'at' in line.lower() or 'company' in line.lower() or 'clients' in line.lower()):
            markdown_lines.append(f'### {line}')
        # Dates and time periods
        elif re.search(r'\b(20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current)\b', line.lower()):
            markdown_lines.append(f'*{line}*')
        # Bullet points
        elif line.startswith(('•', '-', '*', '◦')):
            markdown_lines.append(f'- {line[1:].strip()}')
        # Skills and technologies
        elif re.search(r'(?i)(php|javascript|react|node|python|java|sql|html|css|laravel|bootstrap|mysql|mongodb|aws|docker|kubernetes)', line.lower()):
            markdown_lines.append(f'- {line}')
        # Regular content
        else:
            markdown_lines.append(line)
    
    # Join lines and clean up
    markdown_text = '\n'.join(markdown_lines)
    
    # Clean up multiple newlines
    markdown_text = re.sub(r'\n{3,}', '\n\n', markdown_text)
    
    return markdown_text.strip()

def main():
    """Main function to parse PDF with multiple Python libraries"""
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python pythonPDFParser.py <pdf_path>"
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    if not os.path.exists(pdf_path):
        print(json.dumps({
            "success": False,
            "error": f"PDF file not found: {pdf_path}"
        }))
        sys.exit(1)
    
    results = {}
    
    # Try different Python PDF parsing libraries
    parsers = [
        ("pdfplumber", parse_with_pdfplumber),
        ("pdfplumber_advanced", parse_with_pdfplumber_advanced),
        ("pymupdf", parse_with_pymupdf),
        ("pymupdf_advanced", parse_with_pymupdf_advanced),
        ("pypdf2", parse_with_pypdf2),
        ("pdfminer", parse_with_pdfminer),
        ("pdfminer_advanced", parse_with_pdfminer_advanced),
        ("pdfquery", parse_with_pdfquery),
        ("tabula_py", parse_with_tabula_py),
        ("camelot", parse_with_camelot),
        ("pdfkit", parse_with_pdfkit),
        ("llamaparse_local", parse_with_llamaparse_local)
    ]
    
    best_result = None
    best_score = 0
    
    for parser_name, parser_func in parsers:
        try:
            result = parser_func(pdf_path)
            if result["success"]:
                # Clean the text
                result["text"] = clean_text(result["text"])
                
                # Format as markdown
                result["markdown"] = format_as_markdown(result["text"])
                
                # Calculate quality score based on text length and structure
                text_length = len(result["text"])
                word_count = len(result["text"].split())
                
                # Simple scoring: prefer longer, more structured text
                score = text_length + (word_count * 2)
                
                if score > best_score:
                    best_score = score
                    best_result = result
                
                results[parser_name] = result
            else:
                results[parser_name] = result
        except Exception as e:
            results[parser_name] = {
                "success": False,
                "error": f"Parser {parser_name} failed: {str(e)}"
            }
    
    # Return the best result or a combined result
    if best_result:
        # Add statistics
        text = best_result["text"]
        word_count = len(text.split()) if text else 0
        char_count = len(text) if text else 0
        
        final_result = {
            "success": True,
            "extractedText": text,
            "markdownText": best_result.get("markdown", text),
            "pageCount": best_result["page_count"],
            "wordCount": word_count,
            "characterCount": char_count,
            "method": f"python-{best_result['method']}",
            "library": best_result["library"],
            "confidence": min(95, max(60, (word_count / 100) * 10)),  # Simple confidence calculation
            "processingTime": 0,  # Will be set by Node.js
            "allResults": results
        }
        
        print(json.dumps(final_result))
    else:
        # All parsers failed
        error_msg = "All Python PDF parsers failed"
        if results:
            errors = [f"{name}: {result.get('error', 'Unknown error')}" 
                     for name, result in results.items() if not result.get('success', False)]
            error_msg += f" - {', '.join(errors)}"
        
        print(json.dumps({
            "success": False,
            "error": error_msg,
            "allResults": results
        }))

if __name__ == "__main__":
    main()
