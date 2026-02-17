# Phase 1 Excel Factor Review

This report covers Phase 1 only: calculation pipeline + Excel outputs.
No backend/frontend app changes are included.

## Files Reviewed

- `DFG_Data.xlsx`
- `Poly_Data_updated.xlsx` (latest regenerated Poly file)
- `PolyCotton_Data.xlsx`
- `PolyDFG_Data.xlsx`
- `PolyPaper_Data.xlsx`
- `EnamelDFG_Data.xlsx`
- `Cotton_Data.xlsx`

## Top 3 Factors per File (Support-Based)

Confidence is normalized within each file using top-3 support scores.

### DFG Data
1. Factor `1.50` — confidence `38.71%`
2. Factor `1.85` — confidence `31.11%`
3. Factor `1.65` — confidence `30.18%`

### Poly Data
1. Factor `1.40` — confidence `34.51%`
2. Factor `1.45` — confidence `34.15%`
3. Factor `1.20` — confidence `31.34%`

### Poly Cotton Data
1. Factor `1.30` — confidence `36.84%`
2. Factor `1.25` — confidence `33.48%`
3. Factor `1.40` — confidence `29.69%`

### Poly DFG Data
1. Factor `1.45` — confidence `55.96%`
2. Factor `1.50` — confidence `26.77%`
3. Factor `1.30` — confidence `17.27%`

### Poly Paper Data
1. Factor `1.10` — confidence `47.08%`
2. Factor `1.35` — confidence `28.58%`
3. Factor `0.85` — confidence `24.34%`

### Enamel DFG Data
1. Factor `0.85` — confidence `38.55%`
2. Factor `1.05` — confidence `33.63%`
3. Factor `1.45` — confidence `27.83%`

### Cotton Data
1. Factor `0.70` — confidence `36.85%`
2. Factor `0.95` — confidence `33.52%`
3. Factor `1.05` — confidence `29.63%`

## Locked Phase 1 Assumptions

1. Layer code aliases are interpreted in calculations:
   - `TPC`, `DPC`, `MPC`, `EN`, `Enamel`, `Enamel + DFG`, OCR variants (`Polu`, `3 or 4`).
2. Insulation percentage quality filter is enforced before factor ranking:
   - keep only rows where `0 < Insulation Per % < 100`.
3. Dual-layer covering uses lower-bound-each-then-sum at row level when two usable layer values are present.
4. `Invoice Date` is retained as a parity column in output sheets.

## Phase 1 Status

- Regeneration completed for all seven files.
- Excel outputs are ready for business validation.
- App/backend changes remain blocked until explicit user approval.
