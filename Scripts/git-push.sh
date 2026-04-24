#!/usr/bin/env bash

#################################
# Git Push Script
# Stage, commit, and push current branch safely
# Usage: ./git-push.sh "commit message"
#
# Safety features:
#   - Blocks files > 100 MB (GitHub hard limit)
#   - Warns about files > 50 MB
#   - Runs git gc to pack objects before push
#################################

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║                Git Push Automation                   ║"
    echo "║                $(date '+%Y-%m-%d %H:%M:%S')                   ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_header

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo -e "${RED}Not a git repository.${NC}"
    exit 1
fi

# Move to repository root so relative paths are stable.
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

COMMIT_MSG="${1:-Update: $(date '+%Y-%m-%d %H:%M:%S')}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Current status:${NC}"
git status --short

# ── Large-file guard ──────────────────────────────────────────
# Check staged + unstaged files for anything over 50 MB.
# GitHub hard limit is 100 MB; warn at 50 MB, block at 100 MB.
echo
echo -e "${BLUE}Checking for large files...${NC}"
BLOCK=0
while IFS= read -r -d '' file; do
    size_bytes=$(wc -c < "$file" 2>/dev/null || echo 0)
    size_mb=$(echo "scale=1; $size_bytes / 1048576" | bc)
    if (( size_bytes > 104857600 )); then   # > 100 MB — BLOCK
        echo -e "${RED}  BLOCKED  ${size_mb} MB  →  $file${NC}"
        echo -e "${RED}  GitHub rejects files over 100 MB. Add to .gitignore or use Git LFS.${NC}"
        BLOCK=1
    elif (( size_bytes > 52428800 )); then  # > 50 MB — WARN
        echo -e "${YELLOW}  WARNING  ${size_mb} MB  →  $file${NC}"
        echo -e "${YELLOW}  Consider adding to .gitignore to avoid future push failures.${NC}"
    fi
done < <(git ls-files --others --cached --exclude-standard -z | xargs -0 -I{} find {} -maxdepth 0 -type f -print0 2>/dev/null)

if [[ $BLOCK -eq 1 ]]; then
    echo
    echo -e "${RED}Push aborted: large file(s) detected above. Remove them from staging and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}  No oversized files found.${NC}"

echo
echo -e "${GREEN}Staging files...${NC}"
git add -A

if git diff --cached --quiet; then
    echo -e "${YELLOW}No staged changes to commit. Nothing to push.${NC}"
    exit 0
fi

echo
echo -e "${BLUE}Staged changes:${NC}"
git status --short

echo
echo -e "${YELLOW}Commit message:${NC} $COMMIT_MSG"
echo -e "${GREEN}Creating commit...${NC}"
git commit -m "$COMMIT_MSG"

# ── Pack objects before push to reduce upload size ────────────
echo
echo -e "${BLUE}Packing objects (gc)...${NC}"
git gc --quiet 2>/dev/null || true

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo
echo -e "${BLUE}Pushing branch:${NC} ${YELLOW}$BRANCH${NC}"

# If branch has no upstream, set it on first push.
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    git push
else
    git push -u origin "$BRANCH"
fi

echo
echo -e "${GREEN}Push completed successfully.${NC}"
echo -e "${BLUE}Last 3 commits:${NC}"
git --no-pager log --oneline -3
