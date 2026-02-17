"""
Universal extractor for insulation PDFs (poly, poly cotton, polydfg, poly paper, Enamel DFG, cotton).
Extracts all columns, preserves structure, outputs 4 CSVs per PDF.
"""

import os
import re
from pathlib import Path

import pandas as pd
import pdfplumber

# Insulation keywords to match (longest first for correct parsing)
INSULATION_KEYWORDS = [
    "3 or 4",
    "Poly + Cotton",
    "Poly + Fibre",
    "Poly + Paper",
    "Mpc",
    "Tpc",
    "Dpc",
    "Polu",
    "Enamel",
    "EN",
    "Edfg",
    "DFG",
    "Polyster",
    "Poly",
    "Paper",
    "Cotton",
]


def extract_all_lines(pdf_path: str) -> list[str]:
    """Extract all text lines from all pages of the PDF."""
    all_lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for line in text.split("\n"):
                    all_lines.append(line.strip())
    return all_lines


def is_month_header(line: str) -> str | None:
    """Detect month header lines."""
    pattern = r"((?:January|February|March|April|May|June|July|August|September|October|November|December)\s*(?:Month\s+)?\d{4})\s*\[?"
    match = re.search(pattern, line, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None


def is_header_line(line: str) -> bool:
    """Detect repeated header lines to skip."""
    skip_patterns = [
        r"^Covering$",
        r"^No\.\s+Invoice",
        r"^Insulation\s+kg",
        r"^Insulation\s+-\s*1",
        r"^Poly \+ Paper & Only Paper",
        r"^\[ No production \]",
    ]
    for pat in skip_patterns:
        if re.match(pat, line, re.IGNORECASE):
            return True
    return False


def find_insulation_keyword(line: str) -> tuple[str | None, int, int]:
    """Return (keyword, start, end) or (None, 0, 0)."""
    line_upper = line.upper()
    for kw in INSULATION_KEYWORDS:
        pattern = rf"(?<![A-Z0-9]){re.escape(kw.upper())}(?![A-Z0-9])"
        m = re.search(pattern, line_upper)
        if m:
            return (kw, m.start(), m.end())
    return (None, 0, 0)


def normalize_insulation_type(raw_kw: str, full_line: str) -> str:
    """
    Normalize OCR/coded insulation markers to semantic insulation labels.
    TPC/DPC/MPC can represent paper or polyester; infer from full row text when possible.
    """
    if not raw_kw:
        return ""
    k = raw_kw.strip().upper()
    line_upper = (full_line or "").upper()

    # OCR variants and explicit layer-count shorthand in polyester sheets
    if k in {"POLYSTER", "POLU", "POLY", "3 OR 4"}:
        return "Poly"
    if k == "TPC":
        if "PAPER" in line_upper:
            return "Paper (TPC)"
        return "Poly (TPC)"
    if k == "DPC":
        if "PAPER" in line_upper:
            return "Paper (DPC)"
        if "POLY" in line_upper:
            return "Poly (DPC)"
        return "DPC"
    if k == "MPC":
        if "PAPER" in line_upper:
            return "Paper (MPC)"
        if "POLY" in line_upper:
            return "Poly (MPC)"
        return "MPC"
    if k == "EDFG":
        return "Enamel + DFG"
    if k in {"EN", "ENAMEL"}:
        return "Enamel"
    return raw_kw


def parse_size_from_before(before: str) -> tuple[str, str, str, str, str, str]:
    """Parse before_part into serial_no, size_raw, size_type, width, thickness, wire_value, wire_unit."""
    before = before.strip()
    serial_no = ""
    size_raw = ""
    size_type = ""
    width = ""
    thickness = ""
    wire_value = ""
    wire_unit = ""

    # Strip trailing optional covering_no (single digit)
    before_clean = re.sub(r"\s+(\d+)$", "", before)
    if before_clean != before:
        serial_no = re.search(r"(\d+)$", before).group(1)
    before = before_clean.strip()

    strip_serial = re.match(r"^(\d+)\s+(\d+\.?\d*)\s*X\s*(\d+\.?\s?\d*)$", before, re.IGNORECASE)
    strip_no_serial = re.match(r"^(\d+\.?\d*)\s*X\s*(\d+\.?\s?\d*)$", before, re.IGNORECASE)
    wire_mm_serial = re.match(r"^(\d+)\s+(\d+\.?\d*)\s*mm$", before, re.IGNORECASE)
    wire_mm_no_serial = re.match(r"^(\d+\.?\d*)\s*mm$", before, re.IGNORECASE)
    wire_swg_serial = re.match(r"^(\d+)\s+(\d+)\s*swg$", before, re.IGNORECASE)
    wire_swg_no_serial = re.match(r"^(\d+)\s*swg$", before, re.IGNORECASE)

    if strip_serial:
        if not serial_no:
            serial_no = strip_serial.group(1)
        w = strip_serial.group(2)
        t = strip_serial.group(3).replace(" ", "")
        width, thickness = w, t
        size_raw = f"{w} X {t}"
        size_type = "Strip"
    elif strip_no_serial:
        w = strip_no_serial.group(1)
        t = strip_no_serial.group(2).replace(" ", "")
        width, thickness = w, t
        size_raw = f"{w} X {t}"
        size_type = "Strip"
    elif wire_mm_serial:
        if not serial_no:
            serial_no = wire_mm_serial.group(1)
        wire_value = wire_mm_serial.group(2)
        wire_unit = "mm"
        size_raw = f"{wire_value} mm"
        size_type = "Wire"
    elif wire_mm_no_serial:
        wire_value = wire_mm_no_serial.group(1)
        wire_unit = "mm"
        size_raw = f"{wire_value} mm"
        size_type = "Wire"
    elif wire_swg_serial:
        if not serial_no:
            serial_no = wire_swg_serial.group(1)
        wire_value = wire_swg_serial.group(2)
        wire_unit = "SWG"
        size_raw = f"{wire_value} SWG"
        size_type = "Wire"
    elif wire_swg_no_serial:
        wire_value = wire_swg_no_serial.group(1)
        wire_unit = "SWG"
        size_raw = f"{wire_value} SWG"
        size_type = "Wire"

    return serial_no, size_raw, size_type, width, thickness, wire_value, wire_unit


def parse_data_line(line: str, current_month: str) -> dict | None:
    """Parse a single data line into a structured dict."""
    if not line or is_header_line(line):
        return None

    material_match = re.search(r"\b(Alu|Cop|ALU|COP)\b", line)
    if not material_match:
        return None

    material_pos = material_match.start()
    material_raw = material_match.group(1)
    material = "Aluminium" if material_raw.upper() == "ALU" else "Copper"

    kw, kw_start, kw_end = find_insulation_keyword(line)
    if not kw:
        return None

    before = line[:kw_start].strip()
    between = line[kw_end:material_pos].strip()
    after_material = line[material_match.end() :].strip()

    result = parse_size_from_before(before)
    serial_no, size_raw, size_type, width, thickness, wire_value, wire_unit = result
    if not size_raw:
        return None

    # Parse insulation tokens
    ins_tokens = between.split()
    ins1 = ins_tokens[0] if len(ins_tokens) >= 1 else ""
    ins2 = ins_tokens[1] if len(ins_tokens) >= 2 else ""
    total_ins = ins_tokens[2] if len(ins_tokens) >= 3 else (ins_tokens[1] if len(ins_tokens) == 2 else ins1)

    # Parse numeric data
    invoice_match = re.search(r"(\d+(?:\s*/\s*\d+)*)$", after_material)
    invoice_no = ""
    numeric_part = after_material
    if invoice_match:
        invoice_no = invoice_match.group(1).replace(" ", "")
        numeric_part = after_material[: invoice_match.start()].strip()

    tokens = numeric_part.split()
    bare_wt = tokens[0] if len(tokens) >= 1 else ""
    final_qty = tokens[1] if len(tokens) >= 2 else ""
    ins_wt = tokens[2] if len(tokens) >= 3 else ""
    scrap = tokens[3] if len(tokens) >= 4 else ""
    ins_pct = tokens[4] if len(tokens) >= 5 else ""

    if len(tokens) == 4:
        scrap = ""
        ins_pct = tokens[3]

    return {
        "Month": current_month,
        "Covering_No": serial_no,
        "Size": size_raw,
        "Size_Type": size_type,
        "Width": width,
        "Thickness": thickness,
        "Wire_Value": wire_value,
        "Wire_Unit": wire_unit,
        "Type_of_Insulation": normalize_insulation_type(kw, line),
        "Insulation_1": ins1,
        "Insulation_2": ins2,
        "Total_Insulation": total_ins,
        "Material": material,
        "Actual_Bare_Wt_kg": bare_wt,
        "Final_Dis_Qty": final_qty,
        "Insulation_Wt": ins_wt,
        "Scrap": scrap,
        "Insulation_Pct": ins_pct,
        "Invoice_No_GST2526": invoice_no,
    }


def process_pdf(pdf_path: str, prefix: str, output_dir: str) -> dict:
    """Extract, sort, and save CSVs. Returns dict with paths and counts."""
    lines = extract_all_lines(pdf_path)
    current_month = ""
    all_entries = []

    for line in lines:
        month = is_month_header(line)
        if month:
            current_month = month
            continue
        if is_header_line(line):
            continue
        entry = parse_data_line(line, current_month)
        if entry:
            all_entries.append(entry)

    if not all_entries:
        return {"total": 0, "paths": []}

    df = pd.DataFrame(all_entries)
    strips = df[df["Size_Type"] == "Strip"].copy()
    wires = df[df["Size_Type"] == "Wire"].copy()

    al_strips = strips[strips["Material"] == "Aluminium"].copy()
    cu_strips = strips[strips["Material"] == "Copper"].copy()
    al_wires = wires[wires["Material"] == "Aluminium"].copy()
    cu_wires = wires[wires["Material"] == "Copper"].copy()

    strip_cols = [
        "Month", "Covering_No", "Size", "Width", "Thickness",
        "Type_of_Insulation", "Insulation_1", "Insulation_2", "Total_Insulation",
        "Material", "Actual_Bare_Wt_kg", "Final_Dis_Qty",
        "Insulation_Wt", "Scrap", "Insulation_Pct", "Invoice_No_GST2526",
    ]
    wire_cols = [
        "Month", "Covering_No", "Size", "Wire_Value", "Wire_Unit",
        "Type_of_Insulation", "Insulation_1", "Insulation_2", "Total_Insulation",
        "Material", "Actual_Bare_Wt_kg", "Final_Dis_Qty",
        "Insulation_Wt", "Scrap", "Insulation_Pct", "Invoice_No_GST2526",
    ]

    # Sort strips
    if len(al_strips) > 0:
        al_strips["Width"] = pd.to_numeric(al_strips["Width"], errors="coerce")
        al_strips["Thickness"] = pd.to_numeric(al_strips["Thickness"], errors="coerce")
        al_strips = al_strips.sort_values(["Width", "Thickness"]).reset_index(drop=True)
    if len(cu_strips) > 0:
        cu_strips["Width"] = pd.to_numeric(cu_strips["Width"], errors="coerce")
        cu_strips["Thickness"] = pd.to_numeric(cu_strips["Thickness"], errors="coerce")
        cu_strips = cu_strips.sort_values(["Width", "Thickness"]).reset_index(drop=True)

    # Sort wires
    def wire_sort_key(row):
        if row["Wire_Unit"] == "mm":
            try:
                v = float(row["Wire_Value"])
            except (ValueError, TypeError):
                v = 0
            return (0, v, 0)
        try:
            v = float(row["Wire_Value"])
        except (ValueError, TypeError):
            v = 0
        return (1, 0, v)

    if len(wires) > 0:
        wires["_sort"] = wires.apply(wire_sort_key, axis=1)
        wires = wires.sort_values("_sort").reset_index(drop=True)
        wires = wires.drop(columns=["_sort"])
        al_wires = wires[wires["Material"] == "Aluminium"].copy()
        cu_wires = wires[wires["Material"] == "Copper"].copy()

    paths = []
    os.makedirs(output_dir, exist_ok=True)

    al_strips[strip_cols].to_csv(os.path.join(output_dir, f"{prefix}_Aluminium_Strips.csv"), index=False)
    paths.append(f"{prefix}_Aluminium_Strips.csv")
    cu_strips[strip_cols].to_csv(os.path.join(output_dir, f"{prefix}_Copper_Strips.csv"), index=False)
    paths.append(f"{prefix}_Copper_Strips.csv")
    al_wires[wire_cols].to_csv(os.path.join(output_dir, f"{prefix}_Aluminium_Wires.csv"), index=False)
    paths.append(f"{prefix}_Aluminium_Wires.csv")
    cu_wires[wire_cols].to_csv(os.path.join(output_dir, f"{prefix}_Copper_Wires.csv"), index=False)
    paths.append(f"{prefix}_Copper_Wires.csv")

    return {
        "total": len(all_entries),
        "al_strips": len(al_strips),
        "cu_strips": len(cu_strips),
        "al_wires": len(al_wires),
        "cu_wires": len(cu_wires),
        "paths": [os.path.join(output_dir, p) for p in paths],
        "dfs": {"al_strips": al_strips, "cu_strips": cu_strips, "al_wires": al_wires, "cu_wires": cu_wires},
    }


def main():
    import sys
    base = Path(r"c:\Projects\Palej Calculation App")
    if len(sys.argv) < 3:
        print("Usage: python extract_insulation_pdf.py <pdf_path> <prefix>")
        print("Example: python extract_insulation_pdf.py 'poly data.pdf' Poly")
        sys.exit(1)
    pdf_path = sys.argv[1]
    prefix = sys.argv[2]
    if not os.path.isabs(pdf_path):
        pdf_path = str(base / pdf_path)
    result = process_pdf(pdf_path, prefix, str(base))
    print(f"Extracted {result['total']} entries")
    print(f"  Aluminium Strips: {result['al_strips']}")
    print(f"  Copper Strips: {result['cu_strips']}")
    print(f"  Aluminium Wires: {result['al_wires']}")
    print(f"  Copper Wires: {result['cu_wires']}")
    for p in result["paths"]:
        print(f"  Saved: {p}")


if __name__ == "__main__":
    main()
