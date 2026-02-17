"""
Add 'factor' column to DFG_Data_Updated_reweighted_tmp.xlsx.
Uses covering = 0.50 for ALL rows (lower bound as requested).
Reverse-engineers factor from Insulation Per % using app formulas.
"""

import re
from pathlib import Path

import pandas as pd

# Covering (mm) - use 0.50 for all rows
COVERING_MM = 0.50

# Densities from app (engine.ts)
DENSITY_ALU = 2.709
DENSITY_CU = 8.89

# SWG to diameter (mm), aligned to standard SWG references + your chart.
# Includes common "ought" labels to handle legacy notations.
SWG_TO_MM = {
    "3/0": 9.4490,
    "2/0": 8.8390,
    "1/0": 8.2360,
    0: 8.2360,
    1: 7.6200,
    2: 7.0100,
    3: 6.4010,
    4: 5.8923,
    5: 5.3848,
    6: 4.8768,
    7: 4.4704,
    8: 4.0640,
    9: 3.6576,
    10: 3.2512,
    11: 2.9464,
    12: 2.6416,
    13: 2.3368,
    14: 2.0320,
    15: 1.8288,
    16: 1.6256,
    17: 1.4224,
    18: 1.2192,
    19: 1.0160,
    20: 0.9144,
    21: 0.8128,
    22: 0.7112,
    23: 0.6096,
    24: 0.5588,
    25: 0.5080,
    26: 0.4572,
    27: 0.4160,
    28: 0.3759,
    29: 0.3454,
    30: 0.3150,
    31: 0.2946,
    32: 0.2743,
    33: 0.2540,
    34: 0.2337,
    35: 0.2134,
    36: 0.1930,
    37: 0.1727,
    38: 0.1524,
    39: 0.1321,
    40: 0.1219,
    41: 0.1118,
    42: 0.1016,
}


def parse_float(s, default=None):
    if s is None or (isinstance(s, str) and str(s).strip() in ("", "---", "--", "#VALUE!")):
        return default
    try:
        return float(str(s).strip().replace(",", "."))
    except (ValueError, TypeError):
        return default


def swg_to_mm(raw_value):
    """Parse SWG gauge label/number to mm diameter."""
    if raw_value is None:
        return None
    s = str(raw_value).strip()
    if s in ("", "---", "--", "#VALUE!"):
        return None

    # Exact label match (e.g., 1/0)
    if s in SWG_TO_MM:
        return SWG_TO_MM[s]

    # Numeric gauge
    n = parse_float(s)
    if n is None:
        return None
    return SWG_TO_MM.get(int(round(n)))


def strip_factor(width, thickness, covering, pct, density):
    """Reverse factor for strip: factor = (bareArea * density * pct) / ((insulatedArea - bareArea) * 100)."""
    bare_area = width * thickness
    insulated_area = (width + covering) * (thickness + covering)
    delta = insulated_area - bare_area
    if delta <= 0:
        return None
    return (bare_area * density * pct) / (delta * 100)


def wire_factor(dia_mm, covering, pct, density):
    """Reverse factor for wire: same formula with bareArea = 0.785*dia^2, insulatedArea = 0.785*(dia+covering)^2."""
    bare_area = 0.785 * dia_mm * dia_mm
    covered_dia = dia_mm + covering
    insulated_area = 0.785 * covered_dia * covered_dia
    delta = insulated_area - bare_area
    if delta <= 0:
        return None
    return (bare_area * density * pct) / (delta * 100)


def process_sheet(df, is_wire):
    """Add 'factor' column. is_wire: True for Aluminium Wires / Copper Wires."""
    factors = []
    for _, row in df.iterrows():
        pct = parse_float(row.get("Insulation Per %"))
        material = str(row.get("Alu / Cop", "")).strip().upper()
        if material.startswith("ALU"):
            density = DENSITY_ALU
        elif material.startswith("COP") or material.startswith("CU"):
            density = DENSITY_CU
        else:
            factors.append("")
            continue

        if pct is None:
            factors.append("")
            continue

        if is_wire:
            wire_raw = row.get("Wire Value")
            wire_val = parse_float(wire_raw)
            unit = str(row.get("Wire Unit", "")).strip().upper()
            if wire_val is None and unit != "SWG":
                factors.append("")
                continue
            if unit == "SWG":
                dia_mm = swg_to_mm(wire_raw if wire_raw is not None else wire_val)
                if dia_mm is None:
                    factors.append("")
                    continue
            else:
                dia_mm = wire_val
            f = wire_factor(dia_mm, COVERING_MM, pct, density)
        else:
            w = parse_float(row.get("Width"))
            t = parse_float(row.get("Thickness"))
            if w is None or t is None:
                factors.append("")
                continue
            f = strip_factor(w, t, COVERING_MM, pct, density)

        factors.append(round(f, 6) if f is not None else "")
    df["factor"] = factors
    return df


def main():
    base = Path(r"c:\Projects\Palej Calculation App")
    path = base / "DFG_Data_Updated_reweighted_tmp.xlsx"
    if not path.exists():
        raise FileNotFoundError(f"Workbook not found: {path}")

    xl = pd.ExcelFile(path)
    sheets_data = {}
    for name in xl.sheet_names:
        df = pd.read_excel(path, sheet_name=name, dtype=str).fillna("")
        is_wire = "Wire" in name
        sheets_data[name] = process_sheet(df, is_wire)

    out_path = path
    try:
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            for name, df in sheets_data.items():
                df.to_excel(writer, sheet_name=name, index=False)
    except PermissionError:
        out_path = base / "DFG_Data_Updated_with_factor.xlsx"
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            for name, df in sheets_data.items():
                df.to_excel(writer, sheet_name=name, index=False)
        print("(Original file locked; wrote to DFG_Data_Updated_with_factor.xlsx)")

    # Report
    print("Added column 'factor' (covering = 0.50 for all rows).")
    print("Workbook:", out_path)
    for name, df in sheets_data.items():
        filled = df["factor"].astype(str).str.strip().ne("").sum()
        print(f"  {name}: {len(df)} rows, factor filled: {filled}")
    # Sample
    for name in list(sheets_data.keys())[:2]:
        df = sheets_data[name]
        sample = df[df["factor"].astype(str).str.strip().ne("")].head(3)
        if not sample.empty:
            print(f"\nSample {name}:")
            print(sample[["Size", "Insulation Per %", "factor"]].to_string(index=False))


if __name__ == "__main__":
    main()
