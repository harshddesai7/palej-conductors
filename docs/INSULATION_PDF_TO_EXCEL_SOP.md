# Insulation PDF to Excel — Standard Operating Procedure

> **Purpose**: Reusable instruction file to transform insulation PDFs into validated 4-tab Excel workbooks with duplicate marking, likely % selection, and reverse-engineered factor. Apply to: DFG, Poly, PolyCotton, PolyDFG, PolyPaper, Enamel DFG, Cotton.

---

## 1. Standardized Workflow (End-to-End)

### 1.1 Overview

| Step | Action | Output |
|------|--------|--------|
| 1 | Extract all rows from PDF | Raw parsed rows |
| 2 | Normalize into canonical schema | Structured DataFrames |
| 3 | Split by material + shape | 4 CSVs or 4 in-memory DataFrames |
| 4 | Sort per rules | Sorted data |
| 5 | Remove rows with missing Insulation Per % | Cleaned data |
| 6 | Create Excel workbook (4 tabs) | `.xlsx` |
| 7 | Add factor column | Updated workbook |
| 8 | Apply duplicate / likely % / top-5 factor markings | Final workbook |

### 1.2 Extraction Rules

- Extract **all rows** from each PDF using line/table hybrid parsing.
- Preserve **every original column** from the source PDF.
- Detect material from line context: `Alu` / `ALU` → Aluminium, `Cop` / `COP` → Copper.
- Detect shape from size format:
  - **Strip**: `WIDTH X THICKNESS` (e.g. `15.00 X 6.00`, `8.90 X 1.20`)
  - **Wire mm**: `VALUE mm` (e.g. `5.60 mm`, `8.25 mm`)
  - **Wire SWG**: `VALUE swg` (e.g. `9 swg`, `10 swg`)

### 1.3 Normalization

- Map internal column names to canonical names for consistency across PDFs.
- **Never drop** original columns; only rename for consistency.
- Add derived columns separately: `Size Key`, `Width`, `Thickness`, `Wire Value`, `Wire Unit`, etc.

### 1.4 Tab Structure

Each workbook must have **exactly 4 sheets**:

| Sheet Name | Content |
|------------|---------|
| Aluminium Strips | Strips, Material = Aluminium |
| Copper Strips | Strips, Material = Copper |
| Aluminium Wires | Wires, Material = Aluminium |
| Copper Wires | Wires, Material = Copper |

### 1.5 Sorting Rules

| Type | Primary Sort | Secondary Sort |
|------|--------------|----------------|
| **Strips** | Width (ascending) | Thickness (ascending) |
| **Wires** | mm first, then SWG | Within mm: value asc; within SWG: value asc |

Wire sort key: `(0, mm_value, 0)` for mm, `(1, 0, swg_value)` for SWG so mm entries appear before SWG.

---

## 2. Column Preservation Rules

### 2.1 Mandatory Columns (from PDF)

Retain all original PDF columns. Typical schema:

- Month, Covering No., Size, Type of Insulation
- Insulation-1, Insulation-2, Total Insulation
- Alu/Cop (Material), Actual Bare Wt (kg), Final Dis.Qty., Insulation Wt, Scrap, Insulation Per %
- Invoice No (GST2526-)

### 2.2 Derived Columns (add, do not replace)

- `Width`, `Thickness` (for strips)
- `Wire Value`, `Wire Unit` (for wires)
- `Size Key` (e.g. `15.00 x 6.00` or `9 SWG`)
- `Duplicate Count`, `Duplicate?`
- `Likely Insulation % Increase`, `Recommended % Marked`
- `factor`, `Factor Reliability Score`, `Top 5 Likely Factor`

### 2.3 Column Parity Checklist

Before sign-off, verify:

- [ ] Every column from the source PDF exists in the output workbook.
- [ ] No original column was dropped or merged without explicit mapping.
- [ ] Derived columns are clearly identifiable (e.g. by naming convention).

---

## 3. Multi-Insulation Parsing Rules

### 3.1 Insulation Type Mapping (per PDF)

| PDF File | Insulation Type | Layers | Notes |
|----------|-----------------|--------|-------|
| DFG data.pdf | DFG | Single | Insulation-1 = covering |
| poly data.pdf | Polyester | Single | Insulation-1 = covering |
| poly cotton.pdf | Polyester + Cotton | Dual | Ins1 = Poly, Ins2 = Cotton |
| polydfg data.pdf | Polyester + DFG | Dual | Ins1 = Poly, Ins2 = DFG |
| poly paper or paper data.pdf | Polyester + Paper | Dual | Ins1 = Poly, Ins2 = Paper |
| Enamel DFG.pdf | Enamel + DFG | Dual | Ins1 = Enamel, Ins2 = DFG |
| cotton data.pdf | Cotton | Single | Insulation-1 = covering |

### 3.2 Effective Covering for Factor Calculation

**Single-layer**: Use `Insulation-1` (or `Total Insulation` if Ins1 missing). For ranges (e.g. `1.0-1.5`), use **lower bound** (1.0).

**Dual-layer (lower-bound-each-then-sum)**:

1. Parse `Insulation-1` and `Insulation-2` as numeric values (mm).
2. For ranges, take the **lower bound** of each.
3. `effective_covering = lower(Ins1) + lower(Ins2)`.

Example: Poly 1.0 mm + Cotton 3.0 mm → `covering = 1.0 + 3.0 = 4.0 mm`.

### 3.3 Fallbacks

- Missing Insulation-1: use Total Insulation if available, else skip factor calculation.
- Invalid tokens (`---`, `--`, `#VALUE!`, blank): treat as missing; do not use for covering.
- If both Ins1 and Ins2 are missing for dual-layer: use Total Insulation as fallback.

---

## 4. Duplicate and Likely % Marking

### 4.1 Duplicate Detection

- **Size Key** = `Width x Thickness` (strips) or `WireValue Unit` (wires).
- Rows with the same Size Key are duplicates.
- Mark duplicate rows with a **distinct color** (e.g. yellow) on Size Key and Duplicate? columns.

### 4.2 Likely Insulation % Selection (Green Mark)

For each unique Size Key group:

1. **Outlier removal**: If 3+ rows, pick the inlier subset (n−1 closest cluster) to drop one outlier.
2. **Scoring** (weights): KG = 0.50, Scrap = 0.25, Match = 0.25.
   - **KG**: Higher actual bare wt (kg) → higher score.
   - **Scrap**: Lower scrap rate (scrap/kg) → higher score.
   - **Match**: Closer to median pct of inlier cluster → higher score.
3. **Tie-break**: Higher kg, then lower pct.
4. Mark the selected row’s **Insulation Per %** and **Likely Insulation % Increase** cells in **green**.

### 4.3 Top 5 Likely Factor (Blue Mark)

1. Compute **Factor Reliability Score** per row:
   - KG weight (0.30), Total weight (0.25), Scrap efficiency (0.20), Match to likely % (0.20), Data completeness (0.05).
2. Bin factors into **0.05 intervals** (e.g. 1.45, 1.50, 1.55).
3. Aggregate support per bin (sum of reliability scores).
4. Select **top 5 bins** by support.
5. Mark rows whose factor falls in those bins with **blue** on factor and Top 5 Likely Factor columns.

---

## 5. Reverse-Engineered Factor Rules

### 5.1 Formula Source

From `src/lib/calculators/engine.ts` and `docs/Calculations.md`:

**Forward** (given factor, compute %):
```
PercentageIncrease = (InsulatedArea - BareArea) × FACTOR × 100 / (BareArea × DENSITY)
```

**Reverse** (given %, compute factor):
```
FACTOR = (BareArea × DENSITY × PercentageIncrease) / ((InsulatedArea - BareArea) × 100)
```

### 5.2 Strip

- `bareArea = Width × Thickness`
- `insulatedArea = (Width + covering) × (Thickness + covering)`
- `factor = (bareArea × density × pct) / ((insulatedArea - bareArea) × 100)`

### 5.3 Wire

- `bareArea = 0.785 × (diameter_mm)²`
- `insulatedArea = 0.785 × (diameter_mm + covering)²`
- `factor = (bareArea × density × pct) / ((insulatedArea - bareArea) × 100)`

### 5.4 Constants

| Constant | Value |
|----------|-------|
| Density (Aluminium) | 2.709 |
| Density (Copper) | 8.89 |

### 5.5 Covering

- **Single-layer**: Use insulation-type default or PDF value (lower bound if range).
- **Dual-layer**: `covering = lower(Ins1) + lower(Ins2)`.
- **Fixed default** (when PDF has no usable value): 0.50 mm.

### 5.6 SWG → mm Mapping

Use the project’s accepted SWG chart. Key entries:

| SWG | mm | SWG | mm |
|-----|-----|-----|-----|
| 3/0 | 9.449 | 12 | 2.642 |
| 2/0 | 8.839 | 13 | 2.337 |
| 1/0, 0 | 8.236 | ... | ... |
| 1 | 7.620 | 42 | 0.1016 |
| 2 | 7.010 | | |

Full table in `add_factor_column.py` (`SWG_TO_MM`). For missing gauges, use standard references (e.g. IEC 60228, BS 3737).

---

## 6. Accuracy & QA Gates

### 6.1 Row and Sheet Counts

- [ ] Total rows in workbook = sum of rows across 4 data sheets.
- [ ] Exactly 4 data sheets: Aluminium Strips, Copper Strips, Aluminium Wires, Copper Wires.
- [ ] Optional: Factor_Top5_Summary sheet for top-5 factor bins.

### 6.2 Numeric Sanity

- [ ] No `#VALUE!` in Insulation Per % for rows used in factor calculation.
- [ ] Missing tokens handled: `""`, `---`, `--`, `#VALUE!`, `nan`.
- [ ] Width, Thickness, Wire Value parseable as numbers where expected.

### 6.3 Spot-Check Formulas

- [ ] Pick 2–3 sample rows per sheet.
- [ ] Manually compute factor using the formulas in Section 5.
- [ ] Compare with script output; tolerance ±0.01 acceptable for rounding.

### 6.4 Validation Outputs (per run)

Capture after each file run:

- Source PDF name
- Row counts per sheet
- Factor fill count per sheet
- Top 5 likely factor values
- List of unresolved anomalies (unparseable lines, missing covering, etc.)

---

## 7. Naming and Versioning

### 7.1 Naming Convention

| Item | Pattern | Example |
|------|---------|---------|
| Intermediate CSVs | `{PREFIX}_Aluminium_Strips.csv`, `_Copper_Strips.csv`, `_Wires.csv` | `DFG_Aluminium_Strips.csv` |
| Final workbook | `{PREFIX}_Data.xlsx` or `{PREFIX}_Data_Updated.xlsx` | `DFG_Data_Updated_reweighted_tmp.xlsx` |
| Backup | `{workbook}.bak_{YYYYMMDD_HHMMSS}` | `DFG_Data.xlsx.bak_20260216_161342` |

### 7.2 Run Log Template

```
Run: {timestamp}
Source PDF: {filename}
Parser: {script_name}
Sheets: Aluminium Strips={n}, Copper Strips={n}, Aluminium Wires={n}, Copper Wires={n}
Factor filled: {counts per sheet}
Top 5 factors: {list}
Anomalies: {list or "None"}
```

---

## 8. Existing Scripts Reference

| Script | Purpose |
|--------|---------|
| `extract_dfg_data.py` | PDF extraction for DFG; adapt for other insulation types |
| `add_factor_column.py` | Add factor column using app formulas |
| `apply_markings_and_top5_factor.py` | Duplicate, likely %, top-5 factor marking |

**Adaptation**: For each new PDF type, create or parameterize an extractor that:
1. Detects the correct insulation keyword (e.g. Poly, Cotton, Enamel).
2. Parses Insulation-1, Insulation-2, Total Insulation per row.
3. Computes effective covering using Section 3.2.
4. Passes covering to `add_factor_column.py` (or equivalent) per row.

---

## 9. Acceptance Criteria

- [ ] SOP is executable step-by-step by a teammate without chat context.
- [ ] Covers all 6 PDFs (poly, poly cotton, polydfg, poly paper, Enamel DFG, cotton) with insulation-specific rules.
- [ ] Guarantees original-column preservation.
- [ ] Guarantees 4-tab workbook structure.
- [ ] Documents duplicate, likely %, and top-5 factor marking methods.
- [ ] Documents reverse-factor formulas with mathematical accuracy verified against `docs/Calculations.md` and `engine.ts`.
