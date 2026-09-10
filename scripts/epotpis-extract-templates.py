"""Prepare native PDF templates in the local templates.json file. Never imports data.

Requires PyMuPDF. Only variable text is removed. Each first-page strip retains
its original PDF text, embedded fonts and graphics; strips can move down when
longer input needs more lines. The two attachments are copied unchanged except
for the contract-number footer. The price table is never reconstructed.
"""
import base64
import hashlib
import json
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "epotpis" / "templates"


def lines(page):
    return [line for block in page.get_text("dict")["blocks"] for line in block.get("lines", [])]


def content(line):
    return "".join(span["text"] for span in line["spans"])


def prepare(path):
    source = fitz.open(path)
    page = source[0]
    text_lines = lines(page)
    find = lambda marker: next(line for line in text_lines if marker in content(line))
    owner = find("NALOGODAVAC:")
    subtitle = find("broj ugovora:")
    date = find("dana [DATUM]")
    signer = find("[IME I PREZIME / FUNKCIJA]")
    rules = [line for line in text_lines if content(line) == "________________________________"]
    # Boundaries lie in the original whitespace between rows/paragraphs.
    bounds = [0, 115, 184, 197, 209.8, 221.5, 790]
    fields = []
    for marker, key in [("[ADRESA NEKRETNINE]", "propertyAddress"), ("[OPIS, POVRŠINA", "descriptionField"), ("[ZK PODACI]", "landRegistry"), ("Ciljana mjesečna", "rent"), ("[TRAJANJE]", "duration"), ("Polog:", "deposit")]:
        line = find(marker)
        span = next(s for s in line["spans"] if "[" in s["text"])
        row = 0 if key in ("propertyAddress", "rent") else 1 if key in ("descriptionField", "duration") else 2
        fields.append({"key": key, "row": row, "x": span["origin"][0], "baseline": span["origin"][1], "right": 297 if span["origin"][0] < 300 else 549.6, "suffix": " EUR" if key in ("rent", "deposit") else ""})
    footer = content(next(line for line in lines(source[1]) if "[BROJ]" in content(line)))
    for p in source:
        for line in lines(p):
            text = content(line)
            if "[BROJ]" in text:
                p.add_redact_annot(fitz.Rect(line["bbox"]), fill=False)
            elif p.number == 0 and "[" in text:
                for span in line["spans"]:
                    if "[" in span["text"]:
                        p.add_redact_annot(fitz.Rect(span["bbox"]), fill=False)
        p.apply_redactions(images=0, graphics=0)
    sanitized = source.tobytes(garbage=4, deflate=True)
    prepared = fitz.open()
    for top, bottom in zip(bounds, bounds[1:]):
        strip_doc = fitz.open(stream=sanitized, filetype="pdf")
        strip = strip_doc[0]
        if top > 0:
            strip.add_redact_annot(fitz.Rect(0, 0, strip.rect.width, top), fill=False)
        strip.add_redact_annot(fitz.Rect(0, bottom, strip.rect.width, strip.rect.height), fill=False)
        strip.apply_redactions(images=0, graphics=1)
        prepared.insert_pdf(strip_doc, from_page=0, to_page=0)
        strip_doc.close()
    prepared.insert_pdf(source, from_page=1, to_page=2)
    pdf_bytes = prepared.tobytes(garbage=4, deflate=True)
    owner_span = next(s for s in owner["spans"] if "[" in s["text"])
    return {"format": "original-pdf-v1", "pdf": base64.b64encode(pdf_bytes).decode(), "pdfSha256": hashlib.sha256(pdf_bytes).hexdigest(),
            "width": page.rect.width, "height": page.rect.height, "bounds": bounds, "fields": fields,
            "subtitle": content(subtitle).replace("[BROJ]/[GODINA]", "{number}"), "subtitleBaseline": subtitle["spans"][0]["origin"][1],
            "owner": {"x": owner_span["origin"][0], "baseline": owner_span["origin"][1], "text": owner_span["text"], "separator": "i "},
            "date": {"x": date["spans"][0]["origin"][0], "baseline": date["spans"][0]["origin"][1], "text": content(date)},
            "signerBaseline": signer["spans"][0]["origin"][1],
            "signatures": [{"x": rule["bbox"][0], "width": rule["bbox"][2] - rule["bbox"][0], "baseline": rule["spans"][0]["origin"][1]} for rule in rules],
            "footer": footer.replace("[BROJ]/[GODINA]", "{number}").replace("stranica 2 od 3", "stranica {page} od {total}"), "footerBaseline": 824.5}


def main():
    output = ROOT / "resources/epotpis/templates/templates.json"
    docs = []
    for kind, name in [("open", "OTVORENO"), ("exclusive", "ISKLJUCIVO")]:
        path = SOURCE / f"MET_{name}_POSREDOVANJE_UGOVOR_I_OPCI_UVJETI_PREDLOZAK_08-09-2026.pdf"
        layout = prepare(path)
        docs.append({"kind": kind, "version": "08.09.2026. PDF", "sourceFile": path.name, "sourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(), "layoutJson": json.dumps(layout, ensure_ascii=False, separators=(",", ":"))})
        print(f"{kind}: native PDF preserved; prepared template {len(layout['pdf'])} base64 characters")
    output.write_text(json.dumps(docs, ensure_ascii=False, indent=2) + "\n")

if __name__ == "__main__":
    main()
