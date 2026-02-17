"""
Extract ALL columns from DFG data.pdf and organize into CSV files.

PDF Columns:
  Covering No. | Size | Type of Insulation | Insulation-1 | Insulation-2 |
  Total Insulation | Alu/Cop | Actual Bare Wt (kg) | Final Dis.Qty. |
  Insulation Wt | Scrap | Insulation Per % | Invoice No GST2526-

Output:
  1. DFG_Aluminium_Strips.csv - sorted by Width asc, Thickness asc
  2. DFG_Copper_Strips.csv   - sorted by Width asc, Thickness asc
  3. DFG_Wires.csv           - sorted by MM asc first, then SWG asc
"""

import pdfplumber
import pandas as pd
import re
import os


def extract_all_lines(pdf_path: str) -> list[str]:
    """Extract all text lines from all pages of the PDF."""
    all_lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for line in text.split('\n'):
                    all_lines.append(line.strip())
    return all_lines


def is_month_header(line: str) -> str | None:
    """Detect month header lines and return the month string."""
    pattern = r'((?:January|February|March|April|May|June|July|August|September|October|November|December)\s*(?:Month\s+)?\d{4})\s*\[?\s*DFG\s*\]?'
    match = re.search(pattern, line, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None


def is_header_line(line: str) -> bool:
    """Detect repeated header lines to skip."""
    skip_patterns = [
        r'^Covering$',
        r'^No\.\s+Invoice\s+Date',
        r'^Insulation\s+kg',
        r'^Insulation\s+-\s*1',
    ]
    for pat in skip_patterns:
        if re.match(pat, line, re.IGNORECASE):
            return True
    return False


def parse_data_line(line: str, current_month: str) -> dict | None:
    """Parse a single data line into a structured dict with ALL columns."""
    if not line or is_header_line(line):
        return None

    # Must contain DFG and a material marker
    if 'DFG' not in line.upper():
        return None

    material_match = re.search(r'\b(Alu|Cop|ALU|COP)\b', line)
    if not material_match:
        return None

    material_pos = material_match.start()
    material_raw = material_match.group(1)
    material = 'Aluminium' if material_raw.upper() == 'ALU' else 'Copper'

    # Split line into: before-DFG | DFG | between-DFG-and-material | material | after-material
    dfg_match = re.search(r'\bDFG\b', line)
    if not dfg_match:
        return None

    before_dfg = line[:dfg_match.start()].strip()
    between = line[dfg_match.end():material_pos].strip()
    after_material = line[material_match.end():].strip()

    # --- Parse size and optional serial number from before_dfg ---
    serial_no = ''
    size_raw = ''
    size_type = ''
    width = ''
    thickness = ''
    wire_value = ''
    wire_unit = ''

    # Try strip patterns first (contains "X")
    # With serial: "1 15.00 X 6.00" or "17 8.90 X 1.20"
    strip_serial = re.match(r'^(\d+)\s+(\d+\.?\d*)\s*X\s*(\d+\.?\s?\d*)$', before_dfg, re.IGNORECASE)
    # Without serial: "15.00 X 6.00"
    strip_no_serial = re.match(r'^(\d+\.?\d*)\s*X\s*(\d+\.?\s?\d*)$', before_dfg, re.IGNORECASE)

    # Wire mm patterns
    # With serial: "13 5.60 mm"
    wire_mm_serial = re.match(r'^(\d+)\s+(\d+\.?\d*)\s*mm$', before_dfg, re.IGNORECASE)
    # Without serial: "8.25 mm"
    wire_mm_no_serial = re.match(r'^(\d+\.?\d*)\s*mm$', before_dfg, re.IGNORECASE)

    # Wire SWG patterns
    # With serial: "10 10 swg" or "11 9 swg"
    wire_swg_serial = re.match(r'^(\d+)\s+(\d+)\s*swg$', before_dfg, re.IGNORECASE)
    # Without serial: "9 swg" or "3 swg"
    wire_swg_no_serial = re.match(r'^(\d+)\s*swg$', before_dfg, re.IGNORECASE)

    if strip_serial:
        serial_no = strip_serial.group(1)
        w = strip_serial.group(2)
        t = strip_serial.group(3).replace(' ', '')  # Fix "8. 00" -> "8.00"
        width = w
        thickness = t
        size_raw = f"{w} X {t}"
        size_type = 'Strip'
    elif strip_no_serial:
        w = strip_no_serial.group(1)
        t = strip_no_serial.group(2).replace(' ', '')
        width = w
        thickness = t
        size_raw = f"{w} X {t}"
        size_type = 'Strip'
    elif wire_mm_serial:
        serial_no = wire_mm_serial.group(1)
        wire_value = wire_mm_serial.group(2)
        wire_unit = 'mm'
        size_raw = f"{wire_value} mm"
        size_type = 'Wire'
    elif wire_mm_no_serial:
        wire_value = wire_mm_no_serial.group(1)
        wire_unit = 'mm'
        size_raw = f"{wire_value} mm"
        size_type = 'Wire'
    elif wire_swg_serial:
        serial_no = wire_swg_serial.group(1)
        wire_value = wire_swg_serial.group(2)
        wire_unit = 'SWG'
        size_raw = f"{wire_value} SWG"
        size_type = 'Wire'
    elif wire_swg_no_serial:
        wire_value = wire_swg_no_serial.group(1)
        wire_unit = 'SWG'
        size_raw = f"{wire_value} SWG"
        size_type = 'Wire'
    else:
        print(f"  [WARN] Could not parse size from: '{before_dfg}' in line: {line}")
        return None

    # --- Parse insulation thickness values from between DFG and material ---
    ins_tokens = between.split()
    ins1 = ''
    ins2 = ''
    total_ins = ''

    if len(ins_tokens) >= 3:
        ins1 = ins_tokens[0]
        ins2 = ins_tokens[1]
        total_ins = ins_tokens[2]
    elif len(ins_tokens) == 2:
        ins1 = ins_tokens[0]
        ins2 = ''
        total_ins = ins_tokens[1]
    elif len(ins_tokens) == 1:
        ins1 = ins_tokens[0]

    # --- Parse numeric data after material ---
    # Extract invoice number from the end (integers with optional "/" separators)
    invoice_match = re.search(r'(\d+(?:\s*/\s*\d+)*)$', after_material)
    invoice_no = ''
    numeric_part = after_material

    if invoice_match:
        invoice_no = invoice_match.group(1).replace(' ', '')
        numeric_part = after_material[:invoice_match.start()].strip()

    # Split remaining numeric tokens
    tokens = numeric_part.split()

    bare_wt = ''
    final_qty = ''
    ins_wt = ''
    scrap = ''
    ins_pct = ''

    if len(tokens) >= 5:
        bare_wt = tokens[0]
        final_qty = tokens[1]
        ins_wt = tokens[2]
        scrap = tokens[3]
        ins_pct = tokens[4]
    elif len(tokens) == 4:
        # Scrap is missing - determine which field is absent
        # Check: if tokens[0] is bare_wt and tokens[1] is final, then
        # ins_wt = final - bare should match tokens[2]
        # If it does, scrap is missing and tokens[3] is ins_pct
        bare_wt = tokens[0]
        final_qty = tokens[1]
        ins_wt = tokens[2]
        scrap = ''
        ins_pct = tokens[3]
    elif len(tokens) == 3:
        bare_wt = tokens[0]
        final_qty = tokens[1]
        ins_wt = tokens[2]
    elif len(tokens) == 2:
        bare_wt = tokens[0]
        final_qty = tokens[1]
    elif len(tokens) == 1:
        bare_wt = tokens[0]

    return {
        'Month': current_month,
        'Covering_No': serial_no,
        'Size': size_raw,
        'Size_Type': size_type,
        'Width': width,
        'Thickness': thickness,
        'Wire_Value': wire_value,
        'Wire_Unit': wire_unit,
        'Type_of_Insulation': 'DFG',
        'Insulation_1': ins1,
        'Insulation_2': ins2,
        'Total_Insulation': total_ins,
        'Material': material,
        'Actual_Bare_Wt_kg': bare_wt,
        'Final_Dis_Qty': final_qty,
        'Insulation_Wt': ins_wt,
        'Scrap': scrap,
        'Insulation_Pct': ins_pct,
        'Invoice_No_GST2526': invoice_no,
    }


def main():
    pdf_path = r"c:\Projects\Palej Calculation App\DFG data.pdf"

    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found at {pdf_path}")
        return

    print("Step 1: Extracting text from PDF...")
    lines = extract_all_lines(pdf_path)
    print(f"  Total lines extracted: {len(lines)}")

    print("Step 2: Parsing data lines...")
    current_month = ''
    all_entries = []

    for line in lines:
        month = is_month_header(line)
        if month:
            current_month = month
            print(f"  Month: {current_month}")
            continue

        if is_header_line(line):
            continue

        entry = parse_data_line(line, current_month)
        if entry:
            all_entries.append(entry)

    print(f"\n  Total entries parsed: {len(all_entries)}")

    # Create master DataFrame
    df = pd.DataFrame(all_entries)

    # Split into categories
    strips = df[df['Size_Type'] == 'Strip'].copy()
    wires = df[df['Size_Type'] == 'Wire'].copy()

    al_strips = strips[strips['Material'] == 'Aluminium'].copy()
    cu_strips = strips[strips['Material'] == 'Copper'].copy()

    # Convert Width/Thickness to float for sorting
    al_strips['Width'] = al_strips['Width'].astype(float)
    al_strips['Thickness'] = al_strips['Thickness'].astype(float)
    al_strips = al_strips.sort_values(['Width', 'Thickness']).reset_index(drop=True)

    cu_strips['Width'] = cu_strips['Width'].astype(float)
    cu_strips['Thickness'] = cu_strips['Thickness'].astype(float)
    cu_strips = cu_strips.sort_values(['Width', 'Thickness']).reset_index(drop=True)

    # Sort wires: mm first (ascending), then SWG (ascending)
    def wire_sort_key(row):
        if row['Wire_Unit'] == 'mm':
            return (0, float(row['Wire_Value']), 0)
        else:  # SWG
            return (1, 0, float(row['Wire_Value']))

    wires['_sort'] = wires.apply(wire_sort_key, axis=1)
    wires = wires.sort_values('_sort').reset_index(drop=True)
    wires = wires.drop(columns=['_sort'])

    # Define output columns
    strip_cols = [
        'Month', 'Covering_No', 'Size', 'Width', 'Thickness',
        'Type_of_Insulation', 'Insulation_1', 'Insulation_2', 'Total_Insulation',
        'Material', 'Actual_Bare_Wt_kg', 'Final_Dis_Qty',
        'Insulation_Wt', 'Scrap', 'Insulation_Pct', 'Invoice_No_GST2526'
    ]
    wire_cols = [
        'Month', 'Covering_No', 'Size', 'Wire_Value', 'Wire_Unit',
        'Type_of_Insulation', 'Insulation_1', 'Insulation_2', 'Total_Insulation',
        'Material', 'Actual_Bare_Wt_kg', 'Final_Dis_Qty',
        'Insulation_Wt', 'Scrap', 'Insulation_Pct', 'Invoice_No_GST2526'
    ]

    output_dir = r"c:\Projects\Palej Calculation App"

    print("\nStep 3: Saving CSV files...")
    al_strips[strip_cols].to_csv(os.path.join(output_dir, 'DFG_Aluminium_Strips.csv'), index=False)
    cu_strips[strip_cols].to_csv(os.path.join(output_dir, 'DFG_Copper_Strips.csv'), index=False)
    wires[wire_cols].to_csv(os.path.join(output_dir, 'DFG_Wires.csv'), index=False)

    # Print summary
    print("\n" + "=" * 60)
    print("EXTRACTION SUMMARY")
    print("=" * 60)
    print(f"  Aluminium Strips : {len(al_strips)} entries")
    print(f"  Copper Strips    : {len(cu_strips)} entries")
    print(f"  Wires (all)      : {len(wires)} entries")
    print(f"    - Aluminium    : {len(wires[wires['Material'] == 'Aluminium'])}")
    print(f"    - Copper       : {len(wires[wires['Material'] == 'Copper'])}")
    print(f"  TOTAL            : {len(all_entries)} entries")

    print("\n  Files saved:")
    print(f"    - DFG_Aluminium_Strips.csv ({len(al_strips)} rows)")
    print(f"    - DFG_Copper_Strips.csv ({len(cu_strips)} rows)")
    print(f"    - DFG_Wires.csv ({len(wires)} rows)")

    # Verification: print first few rows of each
    print("\n" + "=" * 60)
    print("SAMPLE DATA VERIFICATION")
    print("=" * 60)

    print("\n--- Aluminium Strips (first 10) ---")
    print(f"{'Width':>6} x {'Thick':>5} | {'Bare Wt':>10} | {'Final':>10} | {'Ins Wt':>10} | {'Scrap':>7} | {'Ins%':>12} | {'Invoice':>10} | Month")
    print("-" * 100)
    for _, r in al_strips.head(10).iterrows():
        print(f"{r['Width']:>6} x {r['Thickness']:>5} | {r['Actual_Bare_Wt_kg']:>10} | {r['Final_Dis_Qty']:>10} | {r['Insulation_Wt']:>10} | {r['Scrap']:>7} | {r['Insulation_Pct']:>12} | {r['Invoice_No_GST2526']:>10} | {r['Month']}")

    print("\n--- Copper Strips (all) ---")
    print(f"{'Width':>6} x {'Thick':>5} | {'Bare Wt':>10} | {'Final':>10} | {'Ins Wt':>10} | {'Scrap':>7} | {'Ins%':>12} | {'Invoice':>10} | Month")
    print("-" * 100)
    for _, r in cu_strips.iterrows():
        print(f"{r['Width']:>6} x {r['Thickness']:>5} | {r['Actual_Bare_Wt_kg']:>10} | {r['Final_Dis_Qty']:>10} | {r['Insulation_Wt']:>10} | {r['Scrap']:>7} | {r['Insulation_Pct']:>12} | {r['Invoice_No_GST2526']:>10} | {r['Month']}")

    print("\n--- Wires (all) ---")
    print(f"{'Value':>6} {'Unit':>4} | {'Material':>10} | {'Bare Wt':>10} | {'Final':>10} | {'Ins Wt':>10} | {'Scrap':>7} | {'Ins%':>12} | {'Invoice':>10} | Month")
    print("-" * 110)
    for _, r in wires.iterrows():
        print(f"{r['Wire_Value']:>6} {r['Wire_Unit']:>4} | {r['Material']:>10} | {r['Actual_Bare_Wt_kg']:>10} | {r['Final_Dis_Qty']:>10} | {r['Insulation_Wt']:>10} | {r['Scrap']:>7} | {r['Insulation_Pct']:>12} | {r['Invoice_No_GST2526']:>10} | {r['Month']}")


if __name__ == "__main__":
    main()
