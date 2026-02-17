# Agent Logs

> **Protected File**: This file logs agent execution summaries and project milestones.
> 
> **Rule**: NEVER DELETE. NEVER MERGE. Only UPDATE/APPEND.

## [2026-02-14] Phase 1: Calculator App Migration
- Scaffolded Next.js + Convex project with light glassmorphic theme.
- Implemented modular math engine in `src/lib/calculators/engine.ts`.
- Built Unified, Bare, Factor, and LME Copper calculators.
- Configured Convex Auth (Password) and seeded `deepak@rediffmail.com` and `workwithharshdesai@gmail.com`.
- Verified build and environment setup.
- **DEPLOYMENT**: Pushed to GitHub `palej-conductors` and deployed to Vercel production `https://palej-conductors.vercel.app`.
- **SEEDING**: Seeded production database with initial users.

## [2026-02-15] Phase 2: Feature Parity & Data Persistence
- **Unified Calculator**: Added Insulation Type dropdown with auto-fill (factor + thickness). Introduced "Synced" vs "Manual" mode.
- **Bare Calculator**: Added 13-value Insulation picklist for Zoho parity.
- **LME Copper**: Added Rate Date field for audit trail.
- **Fabrication List**: Imported 139 production logs from XLSX → JSONL → Convex. Built searchable dashboard.
- **Competitor Rates**: Full market intelligence module with entry form, effective rate calculation, and historical table.
- **Work Instructions**: Production queue with PENDING → ACTIVE → COMPLETED status machine.
- **Die Calculator**: Aluminium die time estimation tool.
- **Saved History**: All 4 calculators now persist inputs/results to `calculations` table (auth-gated).
- **New Convex tables**: `fabrication`, `calculations`, `competitor_rates`, `work_instructions`.
- **New Convex functions**: `calculations.ts`, `competitor_rates.ts`, `instructions.ts`.
- **Sidebar**: Added Work Instructions and Die Calculator navigation links.
- **Cleanup**: Removed unused icon imports from `competitors/page.tsx` and `instructions/page.tsx`.
- **Verification**: `tsc --noEmit` = 0 errors. `next build` = 13/13 pages. `convex dev --once` = all indexes created.

## [2026-02-15] Phase 3: Forensic Parity Audit & Implementation
- **Deep Audit**: Forensic 4-pass read of all 50+ forms (13,818 lines) in `PCPL-development.ds`.
- **Bug Discovery**: Found material-dependent factor error for Polyester Alu (1.08 → 1.396) and 10x default thickness error (0.05 → 0.50).
- **Dual-Layer Discovery**: Extracted two-stage reduction math for Poly+DFG 225 combo products.
- **Algebraic Verification**: Confirmed algebraic equivalence of all Total Hours formulas across legacy variants.
- **Implementation**: Updated `engine.ts` with refined constants. Built specialized `calculateDualLayer` functions for Strip/Wire.
- **UI Integration**: Updated Unified/Bare calculators with material-aware auto-fills and unverified warnings.
- **Documentation**: Created `docs/Calculations.md` as the definitive math reference for the project.
- **Verification**: Verified math logic accuracy via `docs/math_verification.ts`.

## [2026-02-15] Phase 4: Debugging & Stabilization
- **Hydration**: Fixed browser-extension-induced hydration mismatches in root `layout.tsx`.
- **Auth Seeding**: Successfully seeded users `deepak009dr@rediffmail.com` and `workwithharshdesai@gmail.com` (pass: `palej2025`).
- **Auth Setup**: Identified requirement for manual `npx convex dev` to initialize `JWT_PRIVATE_KEY` on the server.
- **Cleanup**: Retained math verification script in `docs/` for audit trail.

## [2026-02-15] - Phase 5: Frontend Deep Audit Complete
- **Status**: 100% Verified
- **Scope**: Unified Calculator (52 permutations)
- **Results**:
  - Aluminium Strip (13/13 verified)
  - Aluminium Wire (Circular logic verified - 23.55% vs theoretical)
  - Copper Factors (verified material-aware switch to 1.08)
  - UI/UX: Hidden values and non-functional arrow fixed.
- **Reference**: `docs/frontend_audit_report.md`, `walkthrough_phase5.md`

## [2026-02-15] - Phase 6: UX Refinements
- **Input Behavior**: Refactored `UnifiedCalculatorPage` state to support empty strings.
  - Eliminated the "0 by default" issue (typing '5' now results in '5', not '05').
  - Verified decimal input support (typing '.5' works).
- **Cleanup**: Removed all `placeholder` attributes from number inputs.
- **Verification**: Browser audit confirmed clean state initialization and reset functionality.

## [2026-02-15] - Deployment
- **Push**: `git push origin master` (Exit Code: 0).
- **Branch**: `master` → `master` (palej-conductors).
- **Content**: Includes Phase 5 (Frontend Audit) and Phase 6 (UX Refinements).

## [2026-02-15] - SOP Update
- **Goal**: Enforce responsiveness verification.
- **Action**: Updated `AGENTS.md` (Step 7) to include mandatory Mobile (375px) and Tablet (768px) checks.
- **Verification**: Confirmed "no placeholder/default" fix works on mobile/tablet viewports.

## [2026-02-15] - Deployment Stabilization
- **Goal**: Resolve Vercel Build failures and account state issues.
- **Action**: Synchronized `AUTH_SECRET` and `CONVEX_URL` to Vercel `Preview` and `Development` environments.
- **Fix**: Added `suppressHydrationWarning` to `<body>` tag in `layout.tsx`.
- **Exclusion**: Updated `tsconfig.json` to exclude `docs/` from production builds.
- **Verification**: Redeployed `main` branch (ID: `8N1UfcJnF`); confirmed status is **Ready**.

## [2026-02-15] - User Management
- **Action**: Registered temporary user `contactus.palejconductors@gmail.com`.
- **Method**: Browser automation via Login/SignUp flow.
- **Expiry warning**: Remind user to remove in 1-2 weeks.

## [2026-02-16] - Migration to Cursor
- **Action**: Migrated repository from anti-gravity to Cursor IDE.
- **Changes**: 
  - Updated `AGENTS.md` to reference Cursor workflows instead of anti-gravity.
  - Updated `.agent/workflows/d.md` and `.agent/workflows/v.md` for Cursor compatibility.
  - Created missing documentation files: `AI_CONTEXT.md`, `LEARNINGS.md`, `LOGS.md`, `REPO_INDEX.md`, `PROJECT_URLS.md`.
  - Removed anti-gravity specific references and file paths.
- **CLI Authentication**: Verified GitHub, Vercel, and Convex CLI authentication with `workwithharshdesai@gmail.com`.

## [2026-02-16] - Workflow Enhancement & Review
- **Action**: Reviewed execution and updated workflows based on anti-gravity reference.
- **Changes**:
  - Enhanced `AGENTS.md` with detailed Goal/Action/Constraint structure matching anti-gravity version.
  - Updated all 7 workflow steps with explicit goals, actions, and constraints.
  - Added `PROJECT_URLS.md` reference in Step 1 (Understand & Contextualize).
  - Made `LOGS.md` MANDATORY in Step 4 research (was optional before).
  - Enhanced Verification First section with Responsiveness requirement (Mobile 375px, Tablet 768px).
  - Added `/v` workflow reference for deep pre-visualization in Step 4.
  - Enhanced Surgical Precision section with constraint about stealth refactoring.
  - Updated `.agent/workflows/d.md` to match enhanced `AGENTS.md` structure.
  - Updated `.agent/workflows/v.md` references to use relative paths.
- **Verification**: All workflow files now match anti-gravity structure while being Cursor-compatible.

## [2026-02-16] - DFG Data Extraction & CSV Generation
- **Goal**: Extract and organize data from `DFG data.pdf` into structured CSV files.
- **Action**: Created `extract_dfg_data.py` script using `pdfplumber` and `pandas` to:
  - Extract strip dimensions (width x thickness format) from PDF
  - Extract wire dimensions (mm or SWG format) from PDF
  - Categorize entries by material type (Aluminium/Copper) using "Alu"/"Cop" markers in context
  - Sort strips by width (ascending) then thickness (ascending)
  - Sort wires by mm (ascending) then SWG (ascending)
  - Preserve duplicates for analysis phase
- **Output Files**:
  - `DFG_Aluminium_Strips.csv`: 88 entries
  - `DFG_Copper_Strips.csv`: 9 entries
  - `DFG_Aluminium_Wires.csv`: 14 entries (6 mm, 8 SWG)
  - `DFG_Copper_Wires.csv`: 2 entries (1 mm, 1 SWG)
- **Key Implementation**: Material detection improved by checking for "Alu" or "Cop" markers in the same line as dimensions, rather than broad context search. Wire extraction filters out false positives by excluding strip dimensions and validating SWG range (0-12).
- **Verification**: Verified sorting order matches user requirements. All CSV files generated successfully with proper formatting.

## [2026-02-16] - Insulation PDF SOP Creation
- **Goal**: Create reusable instruction file for processing multiple insulation PDFs (poly, poly cotton, polydfg, poly paper, Enamel DFG, cotton) into 4-tab Excel workbooks.
- **Action**: Created `docs/INSULATION_PDF_TO_EXCEL_SOP.md` with:
  - Standardized workflow (extraction, normalization, tab-splitting, sorting)
  - Column preservation rules and parity checklist
  - Multi-insulation parsing (single vs dual layer, lower-bound-each-then-sum for covering)
  - Duplicate/likely % marking and top-5 factor logic
  - Reverse-engineered factor formulas (verified against `docs/Calculations.md` and `engine.ts`)
  - SWG→mm mapping reference, QA gates, naming conventions
- **Math Verification**: Factor reverse formula `(bareArea × density × pct) / ((insulatedArea - bareArea) × 100)` confirmed against app engine and Calculations.md.

## [2026-02-16] - Insulation PDF Pipeline Execution (6 PDFs)
- **Goal**: Execute full SOP pipeline for all 6 pending insulation PDFs.
- **Action**:
  - Created `extract_insulation_pdf.py`: Universal extractor supporting Poly, PolyCotton, PolyDFG, PolyPaper, Edfg, Cotton keywords.
  - Created `run_insulation_pipeline.py`: End-to-end pipeline (extract → clean → Excel → factor → markings).
  - Ran pipeline for: poly data.pdf, poly cotton.pdf, polydfg data.pdf, poly paper or paper data.pdf, Enamel DFG.pdf, cotton data.pdf.
- **Outputs** (4-tab Excel each): `Poly_Data.xlsx`, `PolyCotton_Data.xlsx`, `PolyDFG_Data.xlsx`, `PolyPaper_Data.xlsx`, `EnamelDFG_Data.xlsx`, `Cotton_Data.xlsx`.
- **Covering**: Single-layer uses Ins1 or 0.50 default; dual-layer (PolyCotton, PolyDFG, PolyPaper, EnamelDFG) uses lower(Ins1)+lower(Ins2) per SOP.

## [2026-02-16] - Cursor Slash Commands Migration
- **Goal**: Add `/d` and `/v` as native Cursor slash commands; remove legacy `.agent/workflows` (from anti-gravity).
- **Action**:
  - Created `.cursor/commands/d.md` — `/d` enforces the 7-step agentic workflow. Type `/d` + task in chat.
  - Created `.cursor/commands/v.md` — `/v` Tesla Pre-Visualization Protocol. Type `/v` + context in chat.
  - Updated `AGENTS.md` and `REPO_INDEX.md` to reference `.cursor/commands/`.
  - Deleted `.agent/workflows/` (d.md, v.md). Retained `.agent/skills/` for Cursor skills.
- **Verification**: Commands appear when typing `/` in Cursor chat. Workflow content preserved and migrated.

## [2026-02-16] - Insulation Pipeline Hardening (Root-Cause Fixes)
- **Goal**: Fix extraction misses and invalid factor propagation in insulation workbook generation.
- **Root Cause Fixes**:
  - Expanded insulation parser aliases: `Polu`, `TPC`, `DPC`, `MPC`, `3 or 4`, `EN`, `Enamel`.
  - Added row-level insulation normalization (`Type_of_Insulation`) with full-row inference for coded layers.
  - Added strict `Insulation %` validity filtering (`0 < % < 100`) before factor and scoring.
  - Added `Invoice Date` parity column in generated workbooks.
  - Updated factor covering logic to use row-level dual-layer detection (not just file-level prefix).
- **Verification**:
  - Parser coverage: `poly data.pdf` improved to **49/49** candidate rows; `poly paper or paper data.pdf` to **88** extracted rows (up from 75).
  - Regenerated all 6 outputs (`Poly` wrote to `Poly_Data_updated.xlsx` because original file was locked/open).
  - All regenerated files now have required tabs, `Invoice Date`, and zero invalid `%` rows.

## [2026-02-16] - Phase 1 Execution (Excel + Calculations Only)
- **Goal**: Execute approved Phase 1 only (no app/backend changes), regenerate Excel outputs, and produce review artifacts for business validation.
- **Action**:
  - Re-ran `run_insulation_pipeline.py` for all relevant PDFs: `DFG`, `Poly`, `PolyCotton`, `PolyDFG`, `PolyPaper`, `EnamelDFG`, `Cotton`.
  - Regenerated all 7 Excel outputs with current hardening rules and layer-code interpretation.
  - Generated review document `docs/PHASE1_EXCEL_FACTOR_REVIEW.md` containing top-3 factors with confidence per file and locked assumptions.
- **Outputs**:
  - `DFG_Data.xlsx`
  - `Poly_Data_updated.xlsx` (canonical `Poly_Data.xlsx` was locked at runtime)
  - `PolyCotton_Data.xlsx`
  - `PolyDFG_Data.xlsx`
  - `PolyPaper_Data.xlsx`
  - `EnamelDFG_Data.xlsx`
  - `Cotton_Data.xlsx`
- **Constraint Followed**: No backend/frontend app code changes were made in this phase.

## [2026-02-16] - Master Consolidated Workbook (Green-Only Rows)
- **Goal**: Produce one master Excel workbook containing per-insulation 4-tab outputs with deduped green-selected rows only.
- **Action**:
  - Added `build_phase1_master_workbook.py`.
  - Built `Phase1_Master_Consolidated.xlsx` from 7 source workbooks (`DFG`, `Poly`, `PolyCotton`, `PolyDFG`, `PolyPaper`, `EnamelDFG`, `Cotton`).
  - Created 28 tabs (`7 x 4`) using naming pattern `<Insulation>_<Alu/Cu>_<Strips/Wires>`.
  - Kept only rows where `Recommended % Marked == Yes`, deduped by `Size Key + Type_of_Insulation`.
  - Preserved row-level factors and highlighted only top-3 factor bins (per insulation workbook) in green on the `factor` column.
- **Verification**:
  - Workbook created successfully with 28 tabs.
  - Sample duplicate check confirmed zero duplicates for combo key in generated sheets.

## [2026-02-16] - Unique-Only Final Pass Per Tab
- **Goal**: Ensure each tab contains only unique values and keep the most likely `% increase` row with weight/scrap preference.
- **Action**:
  - Added `enforce_unique_master_tabs.py`.
  - Produced `Phase1_Master_Consolidated_Unique.xlsx` from `Phase1_Master_Consolidated.xlsx`.
  - Applied tab-level uniqueness by `Size Key`/`Size`.
  - Selection priority for collisions: green-marked row, then higher weight, then lower scrap-rate.
- **Verification**:
  - `unique_check True` across all non-empty tabs.
  - Opened `Phase1_Master_Consolidated_Unique.xlsx` in Microsoft Excel.

## [2026-02-16] - Sidebar Cleanup (LME Copper & Settings Removal)
- **Goal**: Remove LME Copper and Settings from sidebar navigation on both staging and production.
- **Changes**:
  - Removed LME Copper from `navigation` array in `src/components/Sidebar.tsx`.
  - Removed Settings footer section from sidebar.
  - Removed unused `TrendingDown` and `Settings` icon imports.
- **Documentation**: Updated `AGENTS.md` to reference sync script (`scripts/sync-staging-to-prod.ps1`) in Pre-Flight and Planning sections.
- **Deployment**: 
  - Staging: Commit `b066610` → `palej-app-staging`
  - Production: Synced via force push → `palej-conductors`
- **Status**: Both environments updated. Sidebar now shows only Unified Calculator and Factor Calculator.

## [2026-02-16] - Production Deployment (Staging → Production Sync)
- **Goal**: Deploy verified staging changes to production.
- **Method**: Created sync script + manual force push.
- **Sync Script**: `scripts/sync-staging-to-prod.ps1` and `.sh` - automated staging→production sync with safety checks.
- **Deployed**: Commit `9ecaa51` → Production (`palej-conductors` repo).
- **Changes Deployed**:
  - Factor Calculator fix (dash display)
  - Unified Calculator Bare mode
  - Sidebar cleanup (3 calculators only)
  - DFG 225 factor update (1.45)
  - Poly+DFG 450/900 presets
  - Playwright test suite
- **Production URL**: https://palej-conductors.vercel.app
- **Status**: Vercel auto-deploying. Verify deployment status in dashboard.

## [2026-02-16] - Staging Frontend Audit (Automated Testing)
- **Goal**: Comprehensive frontend testing of staging app after UI consolidation.
- **Method**: Playwright E2E automated testing (8 test cases).
- **Results**: ✅ **ALL 8 TESTS PASSING** (21.6s duration)
- **Test Coverage**:
  - ✅ Sidebar navigation (3 calculators only)
  - ✅ Factor Calculator: Dash display when incomplete, correct calculation
  - ✅ Unified Calculator: Mode toggle (Insulated/Bare)
  - ✅ Unified Calculator: Bare mode calculations (20 mm², 54.18 kg verified)
  - ✅ Unified Calculator: kV selector for Poly+DFG presets
  - ✅ Bare redirect: /dashboard/bare → /calculator?mode=bare
  - ✅ Save functionality: All calculators
- **Artifacts**: `docs/test_staging.spec.ts`, `docs/staging_audit_results.md`, `playwright.config.ts`
- **Status**: All critical functionality verified. Ready for production deployment.

## [2026-02-16] - Staging UI Consolidation (Modules Hidden)
- **Goal**: Simplify staging UI; preserve code for future restoration.
- **Factor Calculator**: Fixed output display — added `percentageIncrease > 0` to condition; show "—" when inputs incomplete.
- **Unified Calculator**: Added Bare mode (Insulated/Bare toggle). Bare mode: dimensions + length → bare area + weight.
- **Bare Calculator**: Removed from sidebar; `/dashboard/bare` redirects to `/dashboard/calculator?mode=bare`.
- **Removed from Sidebar** (pages retained, accessible via direct URL):
  - Bare Calculator (functionality merged into Unified Calculator)
  - Fabrication List
  - Competitor Rates
  - Work Instructions
  - Die Calculator
- **Restore later**: Re-add items to `navigation` in [src/components/Sidebar.tsx](src/components/Sidebar.tsx). Consider enhancing with better functionalities before re-enabling.

## [2026-02-16] - Phase 2 Completion: Poly+DFG 450/900 & Staging Deploy
- **Goal**: Complete remaining Phase 2 plan items and deploy to staging (local → live).
- **Engine** (`src/lib/calculators/engine.ts`):
  - Added `Poly + Dfg 450` and `Poly + Dfg 900` presets with kVOptions (8 kV / 18 kV), same factors as 225.
- **Verification**:
  - `npx tsx docs/verify_calculators.ts` — 29/29 passed.
  - `npm run build` — passed (requires `NEXT_PUBLIC_CONVEX_URL` in env for local build).
- **Deploy**: Pushed to `palej-app-staging` (master). Vercel auto-deploys on push.
- **Status**: Staging live at https://palej-app-staging.vercel.app. User to verify Poly+DFG 450/900 in calculator UI.

## [2026-02-17] - Staging Deployment (palej-app-staging)
- **Goal**: Deploy Phase 2 changes to a new staging project (Vercel, GitHub, Convex) without touching production.
- **GitHub**: Created [palej-app-staging](https://github.com/harshddesai7/palej-app-staging), pushed Phase 2 baseline.
- **Vercel**: Created [palej-app-staging](https://palej-app-staging.vercel.app), linked to GitHub, deployed successfully.
- **Convex**: Using existing dev deployment (keen-raccoon-545) for now. To create dedicated staging Convex: Dashboard → New Project → deploy schema → update Vercel env vars.
- **Env vars**: NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_CONVEX_SITE_URL, AUTH_SECRET added to Vercel Production and Preview.
- **Status**: Staging live at https://palej-app-staging.vercel.app. User to verify, then update production when ready.

## [2026-02-16] - Login / Tailwind Resolution Fix
- **Issue**: "Log in not working" — Tailwind resolve error: `tailwindcss` resolved from `C:\Projects\` instead of project folder, causing CSS/build failure and stuck "Rendering..." state.
- **Root cause**: Dev server run with wrong working directory (e.g. workspace root `C:\Projects` instead of `Palej Calculation App`).
- **Fix**: 
  - Added `dev.ps1` — runs `npm run dev` from script directory; use `.\dev.ps1` to avoid cwd issues.
  - Added `.vscode/tasks.json` — "Dev: Palej Calculation App" task runs dev with correct cwd when workspace is the project folder.
- **User action**: Ensure Cursor is opened with **File > Open Folder > Palej Calculation App** (not the parent `Projects` folder). Or run `cd "c:\Projects\Palej Calculation App"` before `npm run dev`, or use `.\dev.ps1`.

## [2026-02-16] - Calculator Math Verification (29/29 Pass)
- **Goal**: Thoroughly verify all calculator math and factor resolution.
- **Method**: Created `docs/verify_calculators.ts` — runs engine functions directly and asserts expected values.
- **Coverage**: Unified (strip/wire single-layer, dual-layer combined factor), factor resolution (DFG, Polyester, Poly+DFG 8kV/18kV, 1 Poly+Paper), default thickness, Bare area/weight, Factor reverse formula, LME Copper (CSP/WWMAI), material-restricted preset.
- **Result**: 29/29 checks passed. Engine math verified accurate.
- **Run**: `npx tsx docs/verify_calculators.ts`
- **Browser**: Production URL loaded; Cursor browser MCP returns metadata only (no interactive snapshot). Manual UI verification recommended when running `npm run dev` locally.

## [2026-02-16] - Phase 2: Insulation kV & Factor Upgrade (App Changes)
- **Goal**: Implement approved app changes for kV selector, updated factors, and new presets per plan.
- **Backup**: Created `.backup/phase2-kv-upgrade/` with engine.ts, calculator-page.tsx, bare-page.tsx.
- **Engine** (`src/lib/calculators/engine.ts`):
  - Extended `InsulationType` with `kVOptions`, `defaultKV`, `layer1Name`, `layer2Name`, `materialRestriction`.
  - Updated factor truth table: DFG (Alu 1.50, Cu 1.70), Polyester (Alu 1.40, Cu 1.30), Cotton (0.70), Enamel+DFG (0.85).
  - Added presets: `Poly + Cotton` (1.30), `1 Poly + Paper (Alu)` (0.95, Alu-only).
  - Poly + Dfg 225: kVOptions 8kV (Alu 1.45) / 18kV (Alu 1.35), Cu 1.45.
  - `getInsulationFactor(type, material, kV?)` now resolves kV-specific factors first.
  - Dual-layer presets use combined factor + summed covering (single-layer formula).
- **Calculator** (`src/app/dashboard/calculator/page.tsx`):
  - Added kV toggle (8 kV / 18 kV) for Poly+DFG preset.
  - Dynamic layer labels (Polyester, Fiberglass, etc.) for dual-layer inputs.
  - Factor field always visible for dual-layer; manual override no longer resets preset.
  - Material-restricted presets filtered; auto-reset to Manual when material conflicts.
  - Save payload includes `kV` when applicable.
- **Bare** (`src/app/dashboard/bare/page.tsx`): Filter presets by `materialRestriction`; reset to Bare when incompatible.
- **Verification**: `npm run build` passed. All 13 pages compiled.

## [2026-02-16] - Readability Cleanup for Sharing
- **Goal**: Make the unique consolidated workbook clearer for non-technical review.
- **Action**:
  - Created `Phase1_Master_Consolidated_Unique_Clear.xlsx`.
  - Removed confusing carry-over columns: `Duplicate Count`, `Duplicate?`, `Recommended % Marked`.
  - Reapplied top-3 factor green highlighting on `factor` column for every tab.
- **Verification**:
  - Opened `Phase1_Master_Consolidated_Unique_Clear.xlsx` in Microsoft Excel.

## [2026-02-17] - Insulation Preset UX Fixes
- **Goal**: Fix dual insulation input visibility, add total insulation display, correct enamel defaults.
- **Changes**:
  - Renamed `1 Poly + Paper (Alu)` to `Poly + Paper` (available for both Aluminium and Copper, factor 0.95).
  - Updated enamel defaults: single layer `Enamel` preset default thickness 0.03 → 0.12 mm.
  - Updated `Enamel + Dfg 900` dual layer: enamel layer default 0.03 → 0.10 mm.
  - Added **Total Insulation (mm)** display field for all presets (computed: single = insulationThickness, dual = layer1 + layer2).
  - Kept `Poly + Paper` as single-input preset (explicit exception despite `+` in name).
- **Files Modified**:
  - `src/lib/calculators/engine.ts`: Preset definitions updated.
  - `src/app/dashboard/calculator/page.tsx`: Added total insulation display UI.
  - `docs/verify_calculators.ts`: Extended with 6 new checks (33 total, all passing).
  - `docs/test_staging.spec.ts`: Added 4 new E2E tests for dual/single inputs, total display, enamel defaults, material availability.
- **Verification**:
  - Engine verification: 33/33 tests passed.
  - TypeScript compilation: `tsc --noEmit` passed.
  - Deployed to staging: Commit `b54ed3b` → `palej-app-staging` repo.
- **Status**: Staging deployment in progress. Ready for production sync after staging validation.
- **Update (2026-02-17)**: Final fix - Combined into single `Poly + Paper` preset (no material suffix):
  - Single preset `Poly + Paper` available for both Aluminium and Copper (factor 0.95)
  - Removed material restrictions
  - Updated verification: 33/33 tests passing
  - Deployed to staging and production
