# Repository Index

> **Protected File**: This file maps the repository structure for quick navigation.
> 
> **Rule**: NEVER DELETE. NEVER MERGE. Only UPDATE/APPEND when files are added/moved/deleted.

## Core Application Files

- [src/lib/calculators/engine.ts](src/lib/calculators/engine.ts): Core math logic for all calculators. Supports kV-specific factors (Poly+DFG 8kV/18kV), material-restricted presets, and combined-factor dual-layer.
- [src/app/dashboard](src/app/dashboard): Authenticated calculator pages.
- [src/app/dashboard/calculator/page.tsx](src/app/dashboard/calculator/page.tsx): Unified Calculator with Insulated/Bare mode toggle, insulation presets & save.
- [src/app/dashboard/bare/page.tsx](src/app/dashboard/bare/page.tsx): Redirects to `/dashboard/calculator?mode=bare` (Bare merged into Unified).
- [src/app/dashboard/factor/page.tsx](src/app/dashboard/factor/page.tsx): Factor Calculator with save.
- [src/app/dashboard/lme/page.tsx](src/app/dashboard/lme/page.tsx): LME Copper Pricing with date field & save.
- [src/app/dashboard/fabrication/page.tsx](src/app/dashboard/fabrication/page.tsx): Fabrication List dashboard (139 imported logs).
- [src/app/dashboard/competitors/page.tsx](src/app/dashboard/competitors/page.tsx): Competitor Rates market intelligence module.
- [src/app/dashboard/instructions/page.tsx](src/app/dashboard/instructions/page.tsx): Work Instructions production queue.
- [src/app/dashboard/die-calculator/page.tsx](src/app/dashboard/die-calculator/page.tsx): Aluminium Die Calculator.

## Backend (Convex)

- [convex/schema.ts](convex/schema.ts): Database schema: `users`, `fabrication`, `calculations`, `competitor_rates`, `work_instructions`.
- [convex/calculations.ts](convex/calculations.ts): Save/autoSave/list mutations for calculation history (auth-gated).
- [convex/feedback.ts](convex/feedback.ts): Submit and list user feedback for calculations.
- [convex/competitor_rates.ts](convex/competitor_rates.ts): Add/list mutations for competitor pricing.
- [convex/instructions.ts](convex/instructions.ts): Create/list/updateStatus for work instructions.
- [convex/fabrication.ts](convex/fabrication.ts): List query for imported fabrication data.

## Components

- [src/components/Sidebar.tsx](src/components/Sidebar.tsx): Sidebar navigation (8 items).

## Documentation

- [docs/Calculations.md](docs/Calculations.md): Definitive math engine formulas and factor matrix.
- [docs/frontend_audit_report.md](docs/frontend_audit_report.md): Record of 52-permutation logic verification.
- [docs/INSULATION_PDF_TO_EXCEL_SOP.md](docs/INSULATION_PDF_TO_EXCEL_SOP.md): Reusable SOP for transforming insulation PDFs to 4-tab Excel workbooks (extraction, marking, reverse-factor).
- [docs/PHASE1_EXCEL_FACTOR_REVIEW.md](docs/PHASE1_EXCEL_FACTOR_REVIEW.md): Phase 1 business-readable review of top-3 factors and confidence for all regenerated Excel files.
- [docs/verify_calculators.ts](docs/verify_calculators.ts): Regression verification script for all calculator math (29 checks). Run: `npx tsx docs/verify_calculators.ts`.
- [docs/test_staging.spec.ts](docs/test_staging.spec.ts): Playwright E2E test suite for staging app (8 tests). Run: `npx playwright test docs/test_staging.spec.ts`.
- [docs/staging_audit_results.md](docs/staging_audit_results.md): Automated frontend audit results (all tests passing).
- [playwright.config.ts](playwright.config.ts): Playwright configuration for E2E testing.
- [Phase1_Master_Consolidated.xlsx](Phase1_Master_Consolidated.xlsx): Master workbook with 28 tabs (7 insulation files x 4 material/shape tabs), green-row-only deduped output, and top-3 factor highlighting.
- [Phase1_Master_Consolidated_Unique.xlsx](Phase1_Master_Consolidated_Unique.xlsx): Final unique-only version per tab (one best row per size key based on green mark, weight, scrap-rate priority).
- [Phase1_Master_Consolidated_Unique_Clear.xlsx](Phase1_Master_Consolidated_Unique_Clear.xlsx): Readability-cleaned unique workbook with duplicate marker columns removed and top-3 factor highlighting preserved.

## Scripts

- [scripts/sync-staging-to-prod.ps1](scripts/sync-staging-to-prod.ps1): PowerShell script to sync staging changes to production.
- [scripts/sync-staging-to-prod.sh](scripts/sync-staging-to-prod.sh): Bash script to sync staging changes to production.
- [scripts/README.md](scripts/README.md): Documentation for sync scripts.

## Configuration & Workflows

- [dev.ps1](dev.ps1): Helper script to run `npm run dev` from project directory (fixes Tailwind resolution when cwd is wrong).
- [.vscode/tasks.json](.vscode/tasks.json): VS Code/Cursor task to run dev server with correct cwd.

- [.cursor/commands/d.md](.cursor/commands/d.md): `/d` Cursor slash command — 7-step agentic workflow.
- [.cursor/commands/v.md](.cursor/commands/v.md): `/v` Cursor slash command — Tesla Pre-Visualization Protocol.
- [AGENTS.md](AGENTS.md): Main agentic SOPs reference.
- [AI_CONTEXT.md](AI_CONTEXT.md): Company and project context.
- [LEARNINGS.md](LEARNINGS.md): Technical insights and learnings.
- [LOGS.md](LOGS.md): Agent execution logs.
- [PROJECT_URLS.md](PROJECT_URLS.md): Project URLs and resources.

## Data Processing Scripts

- [extract_dfg_data.py](extract_dfg_data.py): PDF extraction script for DFG data. Extracts strip and wire dimensions, categorizes by material (Aluminium/Copper), and generates sorted CSV files.
- [extract_insulation_pdf.py](extract_insulation_pdf.py): Universal extractor for Poly, PolyCotton, PolyDFG, PolyPaper, Enamel DFG, Cotton PDFs (includes aliases: TPC/DPC/MPC/Polu/EN and row-level normalization).
- [run_insulation_pipeline.py](run_insulation_pipeline.py): Full pipeline: extract → clean (valid Ins% range) → Excel (4 tabs + Invoice Date parity) → factor → markings.
- [build_phase1_master_workbook.py](build_phase1_master_workbook.py): Consolidates 7 processed workbooks into one 28-tab master workbook using only green-selected rows, dedupe by size/insulation, and marks top-3 factors in green.
- [enforce_unique_master_tabs.py](enforce_unique_master_tabs.py): Enforces unique rows per tab in the consolidated workbook using most-likely row scoring (green flag + weight + scrap).
- [DFG_Aluminium_Strips.csv](DFG_Aluminium_Strips.csv): Aluminium strip data sorted by width (ascending) then thickness (ascending).
- [DFG_Copper_Strips.csv](DFG_Copper_Strips.csv): Copper strip data sorted by width (ascending) then thickness (ascending).
- [DFG_Aluminium_Wires.csv](DFG_Aluminium_Wires.csv): Aluminium wire data sorted by mm (ascending) then SWG (ascending).
- [DFG_Copper_Wires.csv](DFG_Copper_Wires.csv): Copper wire data sorted by mm (ascending) then SWG (ascending).

## Environment

- `.env.local`: Local environment variables (not tracked in git).
