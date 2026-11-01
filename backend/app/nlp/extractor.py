"""
Document Text Extractor for PDF, DOCX, and Plain Text files.
Uses PyMuPDF and python-docx to extract high-fidelity text while preserving line and section boundaries.
"""

import io
import re
from typing import Tuple, Dict, Any


def clean_text(raw_text: str) -> str:
    """Normalize whitespace and strip unprintable characters."""
    # Replace multiple empty lines with double newline
    text = re.sub(r'\r\n', '\n', raw_text)
    text = re.sub(r'\r', '\n', text)
    # Remove control characters except tab and newline
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Collapse 3+ newlines to 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def extract_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extract text and page count from PDF bytes using PyMuPDF.
    """
    import pymupdf
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    pages_text = []
    page_count = len(doc)

    for page in doc:
        pages_text.append(page.get_text("text"))

    doc.close()
    full_text = "\n\n".join(pages_text)
    return clean_text(full_text), page_count


def extract_from_docx(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extract text from DOCX bytes using python-docx.
    """
    import docx
    file_stream = io.BytesIO(file_bytes)
    doc = docx.Document(file_stream)

    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

    # Also extract text from any tables
    for table in doc.tables:
        for row in table.rows:
            row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            if row_text:
                paragraphs.append(row_text)

    full_text = "\n\n".join(paragraphs)
    # Estimate page count (~500 words per page in typical resume format)
    word_count = len(full_text.split())
    page_count = max(1, (word_count + 450) // 500)
    return clean_text(full_text), page_count


def extract_from_txt(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extract text from plain text bytes with charset fallbacks.
    """
    try:
        text = file_bytes.decode('utf-8')
    except UnicodeDecodeError:
        text = file_bytes.decode('latin-1', errors='ignore')

    word_count = len(text.split())
    page_count = max(1, (word_count + 450) // 500)
    return clean_text(text), page_count


def extract_resume_text(filename: str, file_bytes: bytes) -> Dict[str, Any]:
    """
    Dispatcher to extract text based on file extension.
    """
    ext = filename.lower().split('.')[-1] if '.' in filename else ''

    if ext == 'pdf':
        text, page_count = extract_from_pdf(file_bytes)
        file_type = 'application/pdf'
    elif ext in ['docx', 'doc']:
        text, page_count = extract_from_docx(file_bytes)
        file_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    elif ext in ['txt', 'md']:
        text, page_count = extract_from_txt(file_bytes)
        file_type = 'text/plain'
    else:
        # Default attempt as PDF then text
        try:
            text, page_count = extract_from_pdf(file_bytes)
            file_type = 'application/pdf'
        except Exception:
            text, page_count = extract_from_txt(file_bytes)
            file_type = 'text/plain'

    words = text.split()
    return {
        'text': text,
        'page_count': page_count,
        'total_words': len(words),
        'file_type': file_type,
    }
