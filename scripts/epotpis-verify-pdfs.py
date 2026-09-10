"""Compare Playwright's generated PDFs with the original client PDFs.

Run after pnpm run epotpis:test. Requires Python 3 and PyMuPDF.
Only local fixture PDFs are read; no Sanity or email access.
"""
import hashlib
import json
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / ".data/check-artifacts"
normalize = lambda text: " ".join(text.split())
docs = json.loads((ROOT / "resources/epotpis/templates/templates.json").read_text())

for kind in ("open", "exclusive"):
    template = next(doc for doc in docs if doc.get("kind") == kind)
    source_path = ROOT / "resources/epotpis/templates" / template["sourceFile"]
    assert hashlib.sha256(source_path.read_bytes()).hexdigest() == template["sourceSha256"]
    source = fitz.open(source_path)
    for joint in (False, True):
        path = ARTIFACTS / f"native-{kind}-{'joint' if joint else 'single'}.pdf"
        generated = fitz.open(path)
        assert len(generated) == len(source) == 3
        first_page = normalize(generated[0].get_text())
        assert "041/2026" in first_page
        assert "Željko Čačić" in first_page and "12345678903" in first_page
        if joint:
            for value in ("Ana Čačić", "47926577116", "Druga ulica 2, Zagreb"):
                assert value in first_page, (path.name, value)
        # Only the broker and the first owner have email fields, with no empty label for the co-owner.
        assert first_page.count("e-pošta:") == 2, (path.name, "unexpected email field")
        assert "owner@example.test" in first_page
        assert "co-owner@example.test" not in first_page
        # Both drawings stay above the original rule, at its original height.
        rules = [span for block in generated[0].get_text("dict")["blocks"]
                 for line in block.get("lines", []) for span in line["spans"]
                 if span["text"] == "________________________________"]
        rule = min(rules, key=lambda span: span["bbox"][0])
        baseline = rule["origin"][1]
        ink = [drawing for drawing in generated[0].get_drawings()
               if drawing.get("color") and abs(drawing["color"][0] - .07) < .01
               and drawing["rect"].x1 < 300]
        assert ink, (path.name, "missing owner signatures")
        assert all(baseline - 15.5 <= d["rect"].y0 <= d["rect"].y1 <= baseline - 1.5 for d in ink), (path.name, "signature outside original height")
        if joint:
            middle = (rule["bbox"][0] + rule["bbox"][2]) / 2
            left = [d for d in ink if d["rect"].x1 <= middle - 4.5]
            right = [d for d in ink if d["rect"].x0 >= middle + 4.5]
            assert left and right and len(left) + len(right) == len(ink), (path.name, "overlapping signatures")
            # Fixture strokes have opposite slopes; confirm first/second person order.
            assert left[0]["items"][0][2].y < left[0]["items"][0][1].y
            assert right[0]["items"][0][2].y > right[0]["items"][0][1].y
        for page in generated:
            text = page.get_text()
            assert "[" not in text, (path.name, "unfilled placeholder")
            assert "Elektronički potpis nalogodavca:" in text
            assert "SHA-256" not in text
        # Every fixed line on the first page survives, even when owners add rows.
        for line in source[0].get_text().splitlines():
            if "[" not in line and line.strip():
                assert normalize(line) in first_page, (path.name, "missing source text", line)
        # The full attachment bodies, including the complete price table, must
        # render pixel-for-pixel identically. Only numbered/signature footers differ.
        for index in (1, 2):
            clip = fitz.Rect(0, 0, source[index].rect.width, 790)
            kwargs = {"matrix": fitz.Matrix(2, 2), "clip": clip, "alpha": False}
            before = source[index].get_pixmap(**kwargs)
            after = generated[index].get_pixmap(**kwargs)
            assert before.samples == after.samples, (path.name, "attachment differs", index + 1)
        generated[0].get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(path.with_suffix(".png"))
        generated[1].get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(path.with_name(path.stem + "-cjenik.png"))
        print(f"PASS {path.name}: all fixed text retained; both attachment bodies pixel-identical")
