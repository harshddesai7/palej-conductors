# AI Context: Palej Conductors (Victory Wires)

## 🏢 Company Overview
- **Name:** Palej Conductors Pvt. Ltd.
- **Brand Name:** Victory Wires
- **Established:** 1987
- **Location:** Palej, Gujarat, India (C1B, 102/25, GIDC Estate, Palej, Dist. Bharuch, Gujarat-392 220)
- **Website:** [www.palejconductors.com](https://www.palejconductors.com)
- **Certifications:** ISO 9001:2015, RoHS Compliant
- **Key People:**
    - **Directors:** Deepak Desai (Dad), Dharmishta Desai (Mom)
    - **Operational Support:** Harsh (User)

## 🎯 Project Goals
- **Objective:** Modernize business operations through apps, automations, content engines, and GTM (Go-To-Market) systems.
- **Scope:** Build anything required to support manufacturing, sales, and operations.
- **Target Market:** **Indian Domestic Market ONLY**. (No exports currently).

## 🏭 Products & Technical Specifications
**"Delivering quality with the speed of light, every time."**

### 1. Enamel Coated Wires & Strips
| Product Type | Standards | Class | Details |
| :--- | :--- | :--- | :--- |
| **Enamelled Rectangular Copper & Al Wires (Strip)** | | | **Size Range:** Area 3.6-75 sqmm, Width 4-20mm, Thick 0.90-6.25mm |
| Polyester Enameled | IS 13730-16 / IEC 60317-16 | 155(F) | |
| Polyesterimide Enameled | IS 13730-28 / IEC 60317-28 | 180(H) | |
| Dual Coat (Polyesterimide + Polyamide-imide) | IS 13730-29 / IEC 60317-29 | 200(C) | Superior thermal properties |
| **Enamelled Round Copper & Al Wires** | | | **Size Range:** 0-12 SWG (Copper & Al) |
| Polyvinyl Acetal (PVA/PVF) | IEC-60317-12 | 'B', 105/120°C | |
| Polyester | IEC-60317-03 / IS-13730-03 | 'F', 155°C | |
| Polyesterimide | IEC-60317-08 / IS-13730-08 | 'H', 180°C | |
| Dual Coat (Polyesterimide + Top Coat) | IEC-60317-13 / IS-13730-13 | 'C', 200°C | |

### 2. Insulation Covered Wires & Strips
| Product Type | Temp Class | Insulation Material | Size/Spec |
| :--- | :--- | :--- | :--- |
| **Fiber Glass Covered** | 155(F), 180(H), 200(C) | Glass Yarn (China Origin) | Strips: 3.6-75 sqmm. Round: 0-12 swg. |
| **Nomex Covered** | 200°C | Nomex Paper (Dupont, USA) | Round: 0-12 swg. Flat: 3.6-75 sqmm. |
| **Mica Covered** | 200°C | Epoxy / Glass Mica | Round: 0-12 swg. Flat: 3.6-75 sqmm. |
| **Paper Covered (DPC)** | 105°C | Kraft Paper (Amotfors, Sweden) | Round: 0-12 swg. Flat: 3.6-75 sqmm. |
| **Cotton Covered** | | Cotton | Round: 0-12 swg. Strips: 3.6-75 sqmm. |
| **Bare Copper/Al** | | Annealed | Strips: 3.6-100 sqmm. Round: 0-12 swg. |

### 3. Raw Material Sources
- **Copper Rod:** Hindustan Copper Ltd.
- **Aluminum Rod:** Balco, Nalco
- **Nomex:** Dupont, USA
- **Enamel:** Elantas Beck
- **Glass Yarn:** China Origin
- **Kraft Paper:** Amotfors, Sweden
- **Mica Tape:** Von Roll / Krempel

## 👥 Target Clients & Market
**Focus:** Indian Domestic Market.
**Client Types:**
- Transformer Manufacturers (Dry type, Oil cooled)
- Electromagnetic & Lifting Magnet Companies
- HT / DC Motor Repairers and Rewinders
- Air Core Reactor Manufacturers
- OEMs of Electrical Equipment

## 🧪 Quality Assurance
- **Tests Performed:** Tan Delta, HV Breakdown, Peel, Elongation, Tensile Strength, Resistance, Springiness, Jerk, Vickers, Stiffness, Heat Shock, Solvent Test, Dimensions, etc.

## 📄 Insulation PDF Processing
- **SOP**: `docs/INSULATION_PDF_TO_EXCEL_SOP.md` — reusable workflow for DFG, Poly, PolyCotton, PolyDFG, PolyPaper, Enamel DFG, Cotton PDFs.
- **Scripts**: `extract_dfg_data.py`, `extract_insulation_pdf.py`, `run_insulation_pipeline.py`, `add_factor_column.py`, `apply_markings_and_top5_factor.py`.
- **Output**: 4-tab Excel per PDF (e.g. `Poly_Data.xlsx`, `PolyCotton_Data.xlsx`, …) with duplicate marking, likely % (green), top-5 factor (blue).
- **Parsing Nuance**: Layer codes (`TPC`, `DPC`, `MPC`, `3 or 4`) and aliases (`Polu`, `EN`) are normalized from row context; Enamel DFG is treated as enamel + double fiberglass.
- **Phase 1 Review Artifact**: `docs/PHASE1_EXCEL_FACTOR_REVIEW.md` captures top-3 likely factors and confidence for business validation before app changes.
- **Master Consolidation Artifact**: `Phase1_Master_Consolidated.xlsx` provides 28 tabs (`7 x 4`) with deduped green-selected rows and top-3 factor highlighting for operational use.
- **Unique Final Artifact**: `Phase1_Master_Consolidated_Unique.xlsx` is the strict unique-per-tab version (one best row per size key) for final sharing.
- **Readability Artifact**: `Phase1_Master_Consolidated_Unique_Clear.xlsx` removes duplicate-marker columns for cleaner non-technical sharing while keeping top-3 factor highlighting.

## 🖥️ Current Application State (Phase 7: Insulation kV Upgrade Complete)
- **Stack:** Next.js 16 + Convex + Tailwind CSS + Convex Auth (Password)
- **Deployment:** 
  - **Production:** Vercel at `palej-conductors.vercel.app` (synced from staging)
  - **Staging:** Vercel at `palej-app-staging.vercel.app` (development/testing)
- **Repositories:**
  - **Staging:** `palej-app-staging` (development repo)
  - **Production:** `palej-conductors` (production repo)
- **Sync Process:** Use `scripts/sync-staging-to-prod.ps1` to sync verified staging changes to production.
- **Current Branch:** `main` (tracks `master`)
- **Auth Users:** 
  - `deepak@rediffmail.com`
  - `workwithharshdesai@gmail.com`
  - `contactus.palejconductors@gmail.com` (Temporary User, added 2026-02-15)
- **Modules (production & staging)**: Sidebar shows Unified Calculator (with Bare mode) and Factor Calculator only. LME Copper, Settings, Fabrication, Competitors, Work Instructions, and Die Calculator removed from nav (pages retained for restoration).
- **Insulation kV Upgrade (Phase 2):**
  - Poly+DFG 225, 450, 900 presets support 8 kV / 18 kV selector (Alu: 1.45 / 1.35).
  - Factors updated per image + Excel top-1 (DFG 1.50/1.70, Poly 1.40/1.30, Cotton 0.70, Enamel+DFG 0.85).
  - New presets: Poly+Cotton (1.30), Poly+Paper (0.95, both materials).
  - Material-restricted presets filtered; dual-layer uses combined factor + summed covering.
- **Insulation Preset UX Fixes (2026-02-17):**
  - `Poly + Paper` split into two material-specific presets: `Poly + Paper (Alu)` and `Poly + Paper (Cu)` (both factor 0.95).
  - Enamel defaults corrected: single layer 0.12 mm, dual layer enamel 0.10 mm.
  - Total Insulation (mm) display added for all presets (shows sum for dual-layer, single value for single-layer).
  - All dual-layer presets show two separate insulation inputs; `Poly + Paper` presets remain single-input (exception).
- **Recent Fixes:**
  - Hydration mismatch resolved in `layout.tsx`.
  - Mobile selector visibility fixed with `ChevronDown`.
  - Production build stabilized by excluding `docs/` from `tsconfig`.
  - Environment variables synchronized across **Production, Preview, and Development** scopes to ensure git-push build stability.

## 🤖 Agent Workflows (Cursor)
- **`/d`**: Cursor slash command at `.cursor/commands/d.md` — 7-step agentic workflow. Use for any task requiring full SOP compliance.
- **`/v`**: Cursor slash command at `.cursor/commands/v.md` — Tesla Pre-Visualization Protocol. Use before complex changes for deep mental simulation.
