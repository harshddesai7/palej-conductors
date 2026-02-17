"""
Full pipeline for insulation PDFs: extract → clean → Excel → factor → markings.
Usage: python run_insulation_pipeline.py <pdf_path> <prefix>
Example: python run_insulation_pipeline.py "poly data.pdf" Poly
"""

import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

import pandas as pd
from openpyxl import load_workbook
from openpyxl.styles import PatternFill

from extract_insulation_pdf import process_pdf

BASE = Path(r"c:\Projects\Palej Calculation App")
DENSITY_ALU = 2.709
DENSITY_CU = 8.89
MISSING = {"", "---", "--", "#VALUE!", "nan", "None"}

SWG_TO_MM = {
    "3/0": 9.4490, "2/0": 8.8390, "1/0": 8.2360, 0: 8.2360,
    1: 7.6200, 2: 7.0100, 3: 6.4010, 4: 5.8923, 5: 5.3848, 6: 4.8768,
    7: 4.4704, 8: 4.0640, 9: 3.6576, 10: 3.2512, 11: 2.9464, 12: 2.6416,
    13: 2.3368, 14: 2.0320, 15: 1.8288, 16: 1.6256, 17: 1.4224, 18: 1.2192,
    19: 1.0160, 20: 0.9144, 21: 0.8128, 22: 0.7112, 23: 0.6096, 24: 0.5588,
    25: 0.5080, 26: 0.4572, 27: 0.4160, 28: 0.3759, 29: 0.3454, 30: 0.3150,
    31: 0.2946, 32: 0.2743, 33: 0.2540, 34: 0.2337, 35: 0.2134, 36: 0.1930,
    37: 0.1727, 38: 0.1524, 39: 0.1321, 40: 0.1219, 41: 0.1118, 42: 0.1016,
}


def parse_float(s, default=None):
    if s is None or (isinstance(s, str) and str(s).strip() in MISSING):
        return default
    try:
        return float(str(s).strip().replace(",", "."))
    except (ValueError, TypeError):
        return default


def parse_lower_bound(s):
    """Parse insulation value; for ranges like '1.0-1.5' return 1.0."""
    if s is None or str(s).strip() in MISSING:
        return None
    s = str(s).strip()
    if "-" in s and not s.startswith("-"):
        parts = s.split("-", 1)
        return parse_float(parts[0].strip())
    return parse_float(s)


def is_dual_layer_row(row):
    """Determine dual-layer rows from row-level insulation content."""
    t = str(row.get("Type_of_Insulation", "")).strip().upper()
    ins2_raw = str(row.get("Insulation_2") or row.get("Insulation-2") or "").strip()
    ins2 = parse_lower_bound(ins2_raw)
    if " + " in t or t == "ENAMEL + DFG":
        return True
    if "(TPC)" in t or "(DPC)" in t or "(MPC)" in t:
        return ins2 is not None
    return ins2 is not None


def effective_covering(row):
    """SOP: single-layer use Ins1 or 0.50 default; dual-layer lower(Ins1)+lower(Ins2)."""
    ins1 = parse_lower_bound(row.get("Insulation_1") or row.get("Insulation-1"))
    ins2 = parse_lower_bound(row.get("Insulation_2") or row.get("Insulation-2"))
    if is_dual_layer_row(row) and ins1 is not None and ins2 is not None:
        return ins1 + ins2
    if ins1 is not None:
        return ins1
    total = parse_lower_bound(row.get("Total_Insulation") or row.get("Total Insulation"))
    if total is not None:
        return total
    return 0.50


def swg_to_mm(raw_value):
    if raw_value is None or str(raw_value).strip() in MISSING:
        return None
    s = str(raw_value).strip()
    if s in SWG_TO_MM:
        return SWG_TO_MM[s]
    n = parse_float(s)
    if n is None:
        return None
    return SWG_TO_MM.get(int(round(n)))


def strip_factor(w, t, covering, pct, density):
    bare = w * t
    ins = (w + covering) * (t + covering)
    delta = ins - bare
    if delta <= 0:
        return None
    return (bare * density * pct) / (delta * 100)


def wire_factor(dia, covering, pct, density):
    bare = 0.785 * dia * dia
    ins = 0.785 * (dia + covering) ** 2
    delta = ins - bare
    if delta <= 0:
        return None
    return (bare * density * pct) / (delta * 100)


def normalize_columns(df, is_strip):
    """Map to canonical names expected by add_factor and apply_markings."""
    out = df.copy()
    out["Insulation Per %"] = out.get("Insulation_Pct", out.get("Insulation Per %", ""))
    out["Alu / Cop"] = out["Material"].map(lambda x: "Alu" if "Alu" in str(x) else "Cop")
    out["Actual Bare wt"] = out.get("Actual_Bare_Wt_kg", out.get("Actual Bare wt", ""))
    out["Final Dis.Qty."] = out.get("Final_Dis_Qty", out.get("Final Dis.Qty.", ""))
    out["Insulation wt kg"] = out.get("Insulation_Wt", out.get("Insulation wt kg", ""))
    out["Wire Value"] = out.get("Wire_Value", out.get("Wire Value", ""))
    out["Wire Unit"] = out.get("Wire_Unit", out.get("Wire Unit", ""))
    if "Invoice Date" not in out.columns:
        out["Invoice Date"] = ""
    return out


def add_factor_to_sheets(sheets, prefix):
    for name, df in sheets.items():
        is_wire = "Wire" in name
        factors = []
        for _, row in df.iterrows():
            pct = parse_float(row.get("Insulation Per %"))
            mat = str(row.get("Alu / Cop", "")).strip().upper()
            density = DENSITY_ALU if mat.startswith("ALU") else DENSITY_CU
            if pct is None:
                factors.append("")
                continue
            cov = effective_covering(row)
            if cov is None or cov <= 0:
                cov = 0.50
            if is_wire:
                wr = row.get("Wire Value")
                unit = str(row.get("Wire Unit", "")).strip().upper()
                if unit == "SWG":
                    dia = swg_to_mm(wr)
                else:
                    dia = parse_float(wr)
                if dia is None:
                    factors.append("")
                    continue
                f = wire_factor(dia, cov, pct, density)
            else:
                w = parse_float(row.get("Width"))
                t = parse_float(row.get("Thickness"))
                if w is None or t is None:
                    factors.append("")
                    continue
                f = strip_factor(w, t, cov, pct, density)
            factors.append(round(f, 6) if f is not None else "")
        df["factor"] = factors
        sheets[name] = df
    return sheets


def run_pipeline(pdf_path: str, prefix: str):
    pdf_path = BASE / pdf_path if not Path(pdf_path).is_absolute() else Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    result = process_pdf(str(pdf_path), prefix, str(BASE))
    if result["total"] == 0:
        print(f"No data extracted from {pdf_path}")
        return

    print(f"Extracted {result['total']} entries")
    dfs = result["dfs"]

    # Clean: remove rows with missing Insulation Per %
    def clean(df):
        col = "Insulation_Pct" if "Insulation_Pct" in df.columns else "Insulation Per %"
        vals = df[col].astype(str).str.strip()
        parsed = vals.map(lambda x: parse_float(x))
        # Keep only valid operational values: 0 < Insulation % < 100
        invalid_numeric = parsed.map(lambda x: x is None or x <= 0 or x >= 100)
        mask = vals.isin(MISSING) | (vals == "") | invalid_numeric
        return df[~mask].copy()

    for k in dfs:
        before = len(dfs[k])
        dfs[k] = clean(dfs[k])
        after = len(dfs[k])
        if before != after:
            print(f"  {k}: removed {before - after} rows with missing Insulation Per %")

    # Sheet names
    sheet_names = ["Aluminium Strips", "Copper Strips", "Aluminium Wires", "Copper Wires"]
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

    sheets = {}
    mapping = {
        "Aluminium Strips": ("al_strips", strip_cols, True),
        "Copper Strips": ("cu_strips", strip_cols, True),
        "Aluminium Wires": ("al_wires", wire_cols, False),
        "Copper Wires": ("cu_wires", wire_cols, False),
    }
    for name, (key, cols, is_strip) in mapping.items():
        df = dfs[key]
        avail = [c for c in cols if c in df.columns]
        sheets[name] = normalize_columns(df[avail].copy(), is_strip)

    # Add factor
    sheets = add_factor_to_sheets(sheets, prefix)

    # Apply markings (import logic from apply_markings)
    from apply_markings_and_top5_factor import (
        apply_formatting,
        apply_row_labels,
        compute_top5_factor_labels,
        process_sheet as process_sheet_markings,
    )

    for name in sheets:
        sheets[name] = process_sheet_markings(sheets[name])
    label_data, summary_df = compute_top5_factor_labels(sheets)
    sheets = apply_row_labels(sheets, label_data)

    out_path = BASE / f"{prefix}_Data.xlsx"
    try:
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            for name in sheet_names:
                sheets[name].to_excel(writer, sheet_name=name, index=False)
            summary_df.to_excel(writer, sheet_name="Factor_Top5_Summary", index=False)
    except PermissionError:
        out_path = BASE / f"{prefix}_Data_updated.xlsx"
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            for name in sheet_names:
                sheets[name].to_excel(writer, sheet_name=name, index=False)
            summary_df.to_excel(writer, sheet_name="Factor_Top5_Summary", index=False)

    apply_formatting(out_path)

    print(f"\nSaved: {out_path}")
    print(f"Top 5 factors: {label_data['top5']}")
    for name in sheet_names:
        df = sheets[name]
        print(f"  {name}: {len(df)} rows, factor filled: {df['factor'].astype(str).str.strip().ne('').sum()}")
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python run_insulation_pipeline.py <pdf_path> <prefix>")
        sys.exit(1)
    run_pipeline(sys.argv[1], sys.argv[2])
