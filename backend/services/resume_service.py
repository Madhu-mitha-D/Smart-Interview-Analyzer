import os
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile
from PyPDF2 import PdfReader
from docx import Document

UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_resume_file(file: UploadFile) -> Tuple[str, str]:
    original_name = file.filename or "resume"
    extension = os.path.splitext(original_name)[1].lower()

    if extension not in [".pdf", ".docx"]:
        raise ValueError("Only PDF and DOCX files are supported.")

    unique_name = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / unique_name

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return str(file_path), original_name


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text_parts = []

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)

    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    text_parts = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(text_parts).strip()


def extract_resume_text(file_path: str) -> str:
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)
    if extension == ".docx":
        return extract_text_from_docx(file_path)

    raise ValueError("Unsupported file format.")