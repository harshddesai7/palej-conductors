# Palej Conductors — Math Engine & Formulas

This document serves as the absolute source of truth for all product calculations, as audited and extracted from the legacy Zoho Creator `.ds` system.

---

## 1. Constants

| Constant | Value | Description |
| :--- | :--- | :--- |
| **Density (Aluminium)** | 2.709 | Specific gravity for Aluminium |
| **Density (Copper)** | 8.89 | Specific gravity for Copper |
| **CSP Multiplier** | 1.055 | LME pricing factor |
| **WWMAI Multiplier** | 1.106 | LME pricing factor |
| **Production Speed** | 256 | Default speed in m/hr for production estimates |

---

## 2. Base Dimensional Formulas

### Strip
- **Bare Area (sq mm)** = `Width × Thickness`
- **Insulated Area (sq mm)** = `(Width + InsulationThickness) × (Thickness + InsulationThickness)`

### Wire
- **Bare Area (sq mm)** = `0.785 × (Diameter)²`
- **Insulated Area (sq mm)** = `0.785 × (Diameter + InsulationThickness)²`

---

## 3. Single-Layer Insulation Formulas

The core logic for "Bare Weight Required" based on a target "Final Weight".

### Step 1: Percentage Increase
`PercentageIncrease = (InsulatedArea - BareArea) × FACTOR × 100 / (BareArea × DENSITY)`

### Step 2: Bare Weight Required
`BareWeightReqd = FinalWeight / (100 + PercentageIncrease) × 100`

---

## 4. Insulation Factor Matrix (The "Truth Table")

| Insulation Type | Alu Factor | Cu Factor | Def. Thk (Strip) | Def. Thk (Wire) |
| :--- | :---: | :---: | :---: | :---: |
| **DFG (225/450/900)** | 1.45 | 1.45 | 0.50 mm | 0.50 mm |
| **Polyester** | 1.396 | 1.08 | 0.50 mm | 0.40 mm |
| **Cotton 32s** | 0.60 | — | 0.60 mm | 0.50 mm |
| **Cotton 42s** | — | 0.43344* | — | 0.50 mm |
| **Enamel** | 1.0 | 1.0 | 0.03 mm | 0.03 mm |
| **Paper / Mica / Nomex** | 1.0 | 1.0 | 0.50 mm | 0.50 mm |

*\*Cotton 42s factor 0.43344 is from current engine, not verified in DS.*

---

## 5. Dual-Layer Formulas (Poly + DFG 225)

These products require a two-stage reduction formula.

### Stage 1: DFG Layer Reduction
- `InnerArea = Strip: (W + PolyCov) * (T + PolyCov) | Wire: 0.785 * (D + PolyCov)²`
- `OuterArea = Strip: (W + PolyCov + DfgCov) * (T + PolyCov + DfgCov) | Wire: 0.785 * (D + PolyCov + DfgCov)²`
- `Outer%Inc = (OuterArea - InnerArea) × 1.45 × 100 / (InnerArea × DENSITY)`
- `WeightAfterPoly = FinalWeight / (100 + Outer%Inc) × 100`

### Stage 2: Polyester Layer Reduction
- `BareArea = Strip: W * T | Wire: 0.785 * D²`
- `InnerArea = (Already calculated in Stage 1)`
- `Inner%Inc = (InnerArea - BareArea) × 1.08 × 100 / (BareArea × DENSITY)`
- **`FinalBareWeightReqd`** = `WeightAfterPoly / (100 + Inner%Inc) × 100`

---

## 6. Production & Estimation Formulas

### Meters Required
`MetersReqd = (QtyPerSpool × 1000) / (BareArea × DENSITY)`

### Production (kg/hr)
`ProductionKgHr = (BareArea × DENSITY × 256) / 1000`

### Total Hours Required
`TotalHoursReqd = BareWeightReqd / ProductionKgHr`
