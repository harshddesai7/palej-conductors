# Learnings

## Enhanced Search Database Table (2026-02-17)
- **Frozen Column Pattern**: Using CSS `position: sticky` with `left: 0` and appropriate `z-index` creates frozen columns that stay visible during horizontal scroll. Critical for wide tables where key identifiers (like timestamps) must remain visible.
- **Multi-Column Sorting UX**: Clickable column headers with visual indicators (up/down arrows) provide intuitive sorting. Using `useMemo` for sorted data prevents unnecessary recalculations on every render.
- **Data Density Optimization**: Reducing text sizes (`text-xs`, `text-[9px]`) and padding (`px-3 py-2`) allows displaying more data without overwhelming the UI. Balance readability with information density.
- **Size Column Formatting**: Combining dimensions with calculated values (e.g., "10×5 (50.00 mm²)") provides context at a glance. Format based on shape type (Strip vs Wire) for clarity.
- **Scrollable Container Pattern**: Using `max-h-[calc(100vh-400px)]` with `overflow-x-auto overflow-y-auto` creates a contained scrollable area that respects viewport height while allowing horizontal overflow for wide tables.

## Per-Feature Storage Architecture (2026-02-17)
- **Database Splitting**: When multiple features share a monolithic table, splitting into feature-specific tables (`unified_calculations`, `factor_calculations`) provides better isolation, scalability, and query performance. Each feature can evolve independently without schema conflicts.
- **Auto-Save UX**: Visible status indicators ("Saving...", "Saved", "Error saving data") provide immediate feedback and build user trust. Debouncing (1s) prevents excessive API calls while maintaining responsiveness.
- **Timestamp Indexing**: Adding `by_timestamp` indexes enables efficient newest-first queries without full table scans. Critical for admin-wide viewing interfaces.
- **Backward Compatibility**: When migrating schemas, making new required fields optional in legacy tables (`saveMode: v.optional()`) allows gradual migration without breaking existing data.
- **Answer Hash Deduplication**: Using content-based hashes (`answerHash`) prevents duplicate saves from rapid user interactions while preserving intentional re-saves with different inputs.

## Backend Auto-Logging & Feedback (2026-02-17)
- **Duplicate Prevention**: When implementing automatic logging on every recalculation, it's critical to use a content-based hash (`answerHash`) to prevent duplicate records from the same user session. Filtering by hash + userId in the mutation ensures database hygiene.
- **Feedback snapshots**: Storing full input/output snapshots in the feedback record itself, rather than just referencing the calculation ID, provides an immutable audit trail even if calculation logic changes later.
- **Feature Flag Gating**: For staging-first rollouts sharing a production backend, frontend feature flags (`NEXT_PUBLIC_*`) allow safe activation and validation without affecting live users until ready.
- **Context**: Staging and production are separate Git repositories with potentially diverged histories.
- **Solution**: Created automated sync script (`scripts/sync-staging-to-prod.ps1` / `.sh`) that:
  - Verifies staging repo context
  - Fetches production state
  - Shows commit diff
  - Uses force push (`--force`) since repos are separate
- **Workflow**: Develop → Test on Staging → Verify → Sync to Production → Verify Production
- **Safety**: Script includes dry-run mode, confirmation prompts, and error handling at each step.
- **Note**: Force push is safe here because staging is the source of truth for new features, and production is a deployment target.

> **Protected File**: This file logs tricky bugs, architectural decisions, and key insights discovered during development.
> 
> **Rule**: NEVER DELETE. NEVER MERGE. Only UPDATE/APPEND.

## Project Context
- **Market Focus**: Indian Domestic Market only. No exports.
- **Key Products**: Enamelled, Fiber Glass, Nomex, Mica, Paper, and Cotton covered wires/strips.
- **Phase 3 Complete**: Comprehensive forensic audit of legacy math (`PCPL-development.ds`). Definitive reference at `docs/Calculations.md`.
- **Phase 4 Complete**: Resolved hydration issues and seeded initial users. Handed off manual backend auth setup to user.
- **Glassmorphism**: Using `backdrop-blur-md` with semi-transparent white backgrounds (`bg-white/70`) creates a premium, high-density professional tool aesthetic in a light theme.
- **Modular Engine**: Isolating math logic from UI components allows for easier verification and future-proofing against constant changes.

## Technical Insights
- **Calculator Verification**: Completed 52-permutation audit of the Unified Calculator. 100% parity confirmed between UI and engine math.
- **Material Awareness**: Confirmed density and factor switching (Alu/Cu) is responsive in the frontend.
- **XLSX Import Pipeline**: For Excel → Convex imports, the pipeline is: `pandas` → JSONL → `npx convex import`. Always handle `#VALUE!` errors in Excel exports with a `safe_float()` wrapper.
- **Convex Schema Gotcha**: When adding tables, always run `npx convex dev --once` after schema changes to push indexes. The `_generated/api.d.ts` file won't include new functions until the push completes.
- **Import Hygiene**: Always clean unused imports after scaffolding UI. `lucide-react` is especially prone to leftover icons.
- **Status Machine Pattern**: For production workflow tools, keep status transitions uni-directional (PENDING → ACTIVE → COMPLETED) to prevent data inconsistency.
- **Insulation Material Nuance**: Polyester factors are material-dependent (Alu=1.396, Cu=1.08) in standalone forms, but the Poly layer in dual-layer combos (Poly+DFG) uses a fixed 1.08 factor regardless of material. Always verify the context of the formula in legacy DS systems.
- **Dual-Layer Reduction**: Combo products require a two-stage Bare Weight reduction (Outer Layer → Inner Layer) rather than a single additive factor for 100% accuracy.
- **Auth Setup (CRITICAL)**: Always use `npx @convex-dev/auth --skip-git-check --allow-dirty-git-state` to initialize auth secrets. This generates proper PKCS#8 RSA keys and sets `JWT_PRIVATE_KEY`, `JWKS`, and `SITE_URL`. **Never** manually set `JWT_PRIVATE_KEY` or `CONVEX_AUTH_SECRET` via CLI — shell quoting mangles PEM formatting and extra env vars conflict with the auth library.
- **Responsiveness**: Removing default values/placeholders must be verified on Mobile/Tablet viewports. Soft keyboards/small screens can expose UX issues missed on desktop. Added to SOP.
- **Hydration Suppression**: Attribute mismatches from browser extensions should be handled at the `<body>` tag using `suppressHydrationWarning`. While the `<html>` tag handles global attributes, specific character-level or class-level injections by agents often target the body, requiring tag-specific suppression to keep the console clean.
- **Vercel Environment Scopes**: Manual CLI deployments (`vercel deploy --prod`) do not automatically sync environment variables to the `Preview` or `Development` scopes. Git-triggered builds on the `main` branch use the `Preview` scope by default. Always verify that `AUTH_SECRET` and `CONVEX_URL` are enabled for **all environments** via the dashboard to prevent "build worker exited" errors.
- **Build Exclusions**: Standalone verification scripts (e.g. `docs/math_verification.ts`) that don't follow the project's root path aliases can cause TypeScript errors during production builds. Use `tsconfig.json`'s `exclude` array to omit these folders from the global compilation to ensure build stability without refactoring non-app code.
- **PDF Data Extraction**: When extracting structured data from PDFs, line-by-line parsing with material markers ("Alu"/"Cop") is more reliable than broad context searches. For wire dimensions, filter out false positives by checking if the line contains strip dimension patterns (width x thickness) before extracting mm/SWG values. Always validate SWG ranges (0-12) to avoid capturing unrelated numbers.
- **Insulation PDF SOP**: For dual-layer insulation (e.g. PolyCotton, PolyDFG), effective covering for reverse-factor = lower(Ins1) + lower(Ins2). Single-layer factor reverse: `factor = (bareArea × density × pct) / ((insulatedArea - bareArea) × 100)`. Strip: insulatedArea = (W+c)(T+c); Wire: insulatedArea = 0.785×(d+c)². Densities: Al=2.709, Cu=8.89.
- **Universal PDF Extractor**: Use longest-first insulation keyword matching (Poly + Cotton, Poly + Fibre, Edfg, DFG, Poly, Paper, Cotton) to parse varied PDF layouts. `run_insulation_pipeline.py` chains extract → clean → Excel → factor → markings in one command.
- **Layer-Code Semantics**: In production sheets, `TPC`/`DPC`/`MPC` are layer-code markers, not standalone materials. Their meaning can be Paper or Polyester and must be inferred from the full row context. `EN` is commonly Enamel. Parser aliases and row-level normalization are required to avoid silent row loss.
- **Quality Gate for Insulation %**: Treat non-positive or extreme `%` values as invalid for pipeline math. Filtering with `0 < Insulation % < 100` prevents invalid factors (e.g., negative factors) from contaminating top-5 factor scoring.
- **Phase Gating Discipline**: For high-impact business logic changes, execute Excel/calculation validation as a dedicated first phase and block app code changes until stakeholder sign-off. This reduced risk of prematurely encoding unverified layer/kV assumptions in product UI.
- **Confidence Scoring Convention**: For file-level factor ranking, confidence can be expressed as `top_support / (sum of top3_support)` to make non-technical review easier while preserving relative support context.
- **Green-Only Consolidation Rule**: For final planning sheets, selecting only `Recommended % Marked == Yes` rows and then deduping by `Size Key + Type_of_Insulation` creates a cleaner operational dataset while preserving all relevant columns and row-level factor values.
- **Unique-Only Tab Rule**: If business wants strictly one row per size in each final tab, run an extra pass on the consolidated workbook to dedupe by `Size Key` (fallback `Size`) using priority: green mark > higher weight > lower scrap-rate.
- **Sharing Clarity Rule**: In final handoff workbooks, legacy helper columns (`Duplicate Count`, `Duplicate?`, `Recommended % Marked`) can confuse business readers; remove them in a clean copy and preserve only actionable highlights (e.g., top-3 factor green marks).

- **Local Build Requirement**: `npm run build` requires `NEXT_PUBLIC_CONVEX_URL` in environment. If missing, ConvexReactClient throws "No address provided". Set via `.env.local` or `$env:NEXT_PUBLIC_CONVEX_URL="https://...convex.cloud"` before build. Vercel injects this automatically.
- **Cursor Slash Commands**: Project commands live in `.cursor/commands/*.md`. Filename = command name (e.g. `d.md` → `/d`). Content is injected as prompt when user types `/d` + message. Migrated from `.agent/workflows/` (anti-gravity) to native Cursor commands.
- **Dual-Layer Combined Factor**: For presets where image/Excel provide a single combined factor (e.g. Poly+DFG 1.45 at 8kV), use single-layer formula with `totalCovering = layer1 + layer2` instead of two-stage per-layer reduction. This matches how factors were derived and simplifies resolution logic. Legacy `calculateDualLayer*` functions retained for potential future use.
- **Factor Calculator**: Output requires `percentageIncrease > 0`; otherwise formula returns 0. Gate the calculation condition and show "—" when inputs incomplete.
- **Bare Mode Consolidation**: Unified Calculator now has Insulated/Bare toggle. Bare mode: dimensions + length → bare area + weight. Use `?mode=bare` for direct link. Components using `useSearchParams` need `Suspense` wrapper for Next.js.
- **Playwright E2E Testing**: Created automated test suite for staging app. All 8 critical tests passing. Use `npx playwright test docs/test_staging.spec.ts` for regression testing. Tests verify UI behavior, calculations, navigation, and redirects. Sequential execution (`--workers=1`) more reliable for state-dependent tests.
- **Staging → Production Sync Script**: Use `scripts/sync-staging-to-prod.ps1` (PowerShell) or `.sh` (Bash) to sync verified staging changes to production. Script includes safety checks, commit diff display, and force push support for separate repos. Documented in `AGENTS.md` Pre-Flight and Planning sections.

---
last_audit: 2026-02-16
status: Phase 7 Complete - Insulation kV upgrade | 100% Math Parity | Cursor /d and /v commands active
---
