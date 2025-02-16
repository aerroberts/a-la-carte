#!/bin/bash
# Quick git add, commit, and push with optional commit message

if [ $# -eq 0 ]; then
  COMMIT_MSG="Pushing changes"
else
  COMMIT_MSG="$*"
fi

git add -A
git commit -m "$COMMIT_MSG"
git push