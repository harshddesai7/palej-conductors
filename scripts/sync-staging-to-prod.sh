#!/bin/bash
# Sync Staging to Production Script
# Usage: ./scripts/sync-staging-to-prod.sh
# 
# This script syncs verified staging changes to production

set -e

DRY_RUN=false
BRANCH="master"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --branch)
            BRANCH="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
STAGING_REPO="https://github.com/harshddesai7/palej-app-staging.git"
PROD_REPO="https://github.com/harshddesai7/palej-conductors.git"
PROD_REMOTE_NAME="production"
STAGING_REMOTE_NAME="origin"

echo -e "\n${YELLOW}=== Staging → Production Sync Script ===${NC}\n"

# Step 1: Verify current repo is staging
echo -e "${YELLOW}[1/6] Verifying staging repository...${NC}"
CURRENT_REMOTE=$(git remote get-url origin)
if [[ ! "$CURRENT_REMOTE" == *"palej-app-staging"* ]]; then
    echo -e "${RED}ERROR: Current repo is not staging!${NC}"
    echo -e "${RED}Expected: $STAGING_REPO${NC}"
    echo -e "${RED}Got: $CURRENT_REMOTE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Staging repository confirmed${NC}"

# Step 2: Check git status
echo -e "\n${YELLOW}[2/6] Checking git status...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}WARNING: Uncommitted changes detected:${NC}"
    git status --short
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Working directory clean${NC}"

# Step 3: Add production remote if not exists
echo -e "\n${YELLOW}[3/6] Setting up production remote...${NC}"
if ! git remote | grep -q "^${PROD_REMOTE_NAME}$"; then
    echo -e "${YELLOW}Adding production remote: $PROD_REPO${NC}"
    git remote add "$PROD_REMOTE_NAME" "$PROD_REPO"
    echo -e "${GREEN}✓ Production remote added${NC}"
else
    echo -e "${GREEN}✓ Production remote already exists${NC}"
fi

# Verify production remote URL
PROD_URL=$(git remote get-url "$PROD_REMOTE_NAME")
if [[ ! "$PROD_URL" == *"palej-conductors"* ]]; then
    echo -e "${RED}ERROR: Production remote URL incorrect!${NC}"
    echo -e "${RED}Expected: $PROD_REPO${NC}"
    echo -e "${RED}Got: $PROD_URL${NC}"
    exit 1
fi

# Step 4: Fetch production state
echo -e "\n${YELLOW}[4/6] Fetching production state...${NC}"
git fetch "$PROD_REMOTE_NAME" "$BRANCH" || {
    echo -e "${RED}ERROR: Failed to fetch production${NC}"
    exit 1
}
echo -e "${GREEN}✓ Production state fetched${NC}"

# Step 5: Show what will be synced
echo -e "\n${YELLOW}[5/6] Analyzing changes...${NC}"
CURRENT_COMMIT=$(git rev-parse HEAD)
PROD_COMMIT=$(git rev-parse "${PROD_REMOTE_NAME}/${BRANCH}")

if [ "$CURRENT_COMMIT" = "$PROD_COMMIT" ]; then
    echo -e "${GREEN}✓ Staging and production are already in sync!${NC}"
    exit 0
fi

COMMIT_COUNT=$(git rev-list --count "${PROD_COMMIT}..${CURRENT_COMMIT}")
echo -e "${YELLOW}Commits to sync: $COMMIT_COUNT${NC}"

echo -e "\n${YELLOW}Recent commits to sync:${NC}"
git log --oneline "${PROD_COMMIT}..${CURRENT_COMMIT}" -10

if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}=== DRY RUN MODE ===${NC}"
    echo -e "${YELLOW}Would push $CURRENT_COMMIT to production/$BRANCH${NC}"
    exit 0
fi

# Step 6: Confirm before push
echo -e "\n${YELLOW}[6/6] Ready to sync...${NC}"
echo -e "${YELLOW}Staging commit: $CURRENT_COMMIT${NC}"
echo -e "${YELLOW}Production commit: $PROD_COMMIT${NC}"
echo ""
echo -e "${YELLOW}This will push staging changes to production.${NC}"
echo -e "${YELLOW}Vercel will automatically deploy after push.${NC}"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# Push to production
echo -e "\n${YELLOW}Pushing to production...${NC}"
git push "$PROD_REMOTE_NAME" "${CURRENT_COMMIT}:refs/heads/${BRANCH}" || {
    echo -e "${RED}ERROR: Push failed!${NC}"
    exit 1
}

echo -e "\n${GREEN}✓ Successfully synced to production!${NC}"
echo -e "${GREEN}Production URL: https://palej-conductors.vercel.app${NC}"
echo -e "${GREEN}Vercel will auto-deploy. Check dashboard for status.${NC}"
echo ""
