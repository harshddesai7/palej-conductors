# Learnings

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
- **Subagent Stability**: Identified systemic `thought_signature` and 500 errors in browser subagent during high-volume tool calls; handled via granular instruction splitting.
- **XLSX Import Pipeline**: For Excel → Convex imports, the pipeline is: `pandas` → JSONL → `npx convex import`. Always handle `#VALUE!` errors in Excel exports with a `safe_float()` wrapper.
- **Convex Schema Gotcha**: When adding tables, always run `npx convex dev --once` after schema changes to push indexes. The `_generated/api.d.ts` file won't include new functions until the push completes.
- **Import Hygiene**: Always clean unused imports after scaffolding UI. `lucide-react` is especially prone to leftover icons.
- **Status Machine Pattern**: For production workflow tools, keep status transitions uni-directional (PENDING → ACTIVE → COMPLETED) to prevent data inconsistency.
- **Insulation Material Nuance**: Polyester factors are material-dependent (Alu=1.396, Cu=1.08) in standalone forms, but the Poly layer in dual-layer combos (Poly+DFG) uses a fixed 1.08 factor regardless of material. Always verify the context of the formula in legacy DS systems.
- **Dual-Layer Reduction**: Combo products require a two-stage Bare Weight reduction (Outer Layer → Inner Layer) rather than a single additive factor for 100% accuracy.
- **Auth Setup (CRITICAL)**: Always use `npx @convex-dev/auth --skip-git-check --allow-dirty-git-state` to initialize auth secrets. This generates proper PKCS#8 RSA keys and sets `JWT_PRIVATE_KEY`, `JWKS`, and `SITE_URL`. **Never** manually set `JWT_PRIVATE_KEY` or `CONVEX_AUTH_SECRET` via CLI — shell quoting mangles PEM formatting and extra env vars conflict with the auth library.
---
last_audit: 2026-02-15
status: Phase 5 Complete - 100% Math Parity Verified
---
- **Hydration Suppression**: Attribute mismatches from browser extensions (e.g. `data-jetski-tab-id`) should be handled at the root `<html>` tag using `suppressHydrationWarning` to keep the console clean for real errors.
