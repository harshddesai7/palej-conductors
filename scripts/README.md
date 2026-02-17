# Sync Scripts

## Staging → Production Sync

**Script**: `sync-staging-to-prod.ps1` (PowerShell) or `sync-staging-to-prod.sh` (Bash)

### Purpose
Quickly sync verified staging changes to production after testing is complete.

### Usage

**PowerShell (Windows)**:
```powershell
.\scripts\sync-staging-to-prod.ps1
```

**Bash (Linux/Mac)**:
```bash
./scripts/sync-staging-to-prod.sh
```

**Dry Run** (test without pushing):
```powershell
.\scripts\sync-staging-to-prod.ps1 -DryRun
```

### What It Does

1. ✅ Verifies you're on staging repository
2. ✅ Checks for uncommitted changes
3. ✅ Adds production remote if needed
4. ✅ Fetches production state
5. ✅ Shows commits that will be synced
6. ✅ Prompts for confirmation
7. ✅ Pushes to production (force push for separate repos)
8. ✅ Triggers Vercel auto-deployment

### Requirements

- Git installed
- Authenticated access to both repos:
  - Staging: `palej-app-staging`
  - Production: `palej-conductors`
- Current directory must be staging repo root

### Safety Features

- ✅ Verifies staging repo before sync
- ✅ Shows commit diff before pushing
- ✅ Requires explicit confirmation
- ✅ Dry-run mode for testing
- ✅ Error handling at each step

### Workflow

1. **Develop & Test on Staging**
   ```bash
   # Make changes, commit, push to staging
   git add .
   git commit -m "feat: new feature"
   git push origin master
   ```

2. **Verify on Staging**
   - Test at https://palej-app-staging.vercel.app
   - Run Playwright tests: `npx playwright test docs/test_staging.spec.ts`

3. **Sync to Production**
   ```powershell
   .\scripts\sync-staging-to-prod.ps1
   ```

4. **Verify Production**
   - Check https://palej-conductors.vercel.app
   - Monitor Vercel deployment dashboard

### Notes

- **Force Push**: Script uses `--force` since staging and production are separate repos with potentially diverged histories
- **Vercel Auto-Deploy**: Production automatically deploys on push to `master`
- **No Merge Conflicts**: Since repos are separate, no merge conflicts occur

---

**Last Updated**: 2026-02-16
