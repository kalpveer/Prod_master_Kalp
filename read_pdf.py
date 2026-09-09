import os
import sys

def extract_pdf_text(pdf_path):
    # Try importing common PDF extraction libraries
    try:
        import pypdf
        print("Using pypdf...")
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for i, page in enumerate(reader.pages):
            text += f"\n--- Page {i+1} ---\n"
            text += page.extract_text() or ""
        return text
    except ImportError:
        pass

    try:
        import pdfplumber
        print("Using pdfplumber...")
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for i, page in enumerate(pdf.pages):
                text += f"\n--- Page {i+1} ---\n"
                text += page.extract_text() or ""
            return text
    except ImportError:
        pass

    try:
        import fitz  # PyMuPDF
        print("Using PyMuPDF (fitz)...")
        doc = fitz.open(pdf_path)
        text = ""
        for i, page in enumerate(doc):
            text += f"\n--- Page {i+1} ---\n"
            text += page.get_text()
        return text
    except ImportError:
        pass

    print("No standard PDF extraction libraries installed. Installing pypdf...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    
    # Try importing pypdf again
    import pypdf
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages):
        text += f"\n--- Page {i+1} ---\n"
        text += page.extract_text() or ""
    return text

if __name__ == '__main__':
    pdf_path = os.path.join('public', 'Website Content.pdf')
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        sys.exit(1)
    
    try:
        text = extract_pdf_text(pdf_path)
        out_path = os.path.join('public', 'Website Content.txt')
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Success! Extracted text written to {out_path}")
    except Exception as e:
        print(f"Error extracting text: {e}")
