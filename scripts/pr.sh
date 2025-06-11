#!/bin/bash
# Script to automate PR creation workflow

# Stage all changes so they're included in the diff
git add -A

# Check if a commit message was provided
if [ $# -eq 0 ]; then
    echo "Generating commit message using Ollama..."
    
    # Generate a commit message using Ollama from the git diff
    GENERATED_MSG=$(git diff --cached | ollama run codellama "Generate a concise, meaningful git commit message (max 50 chars) from this diff. Focus on the 'what' and 'why'. Format: just the commit message without quotes:" | head -n 1)
    
    # Fallback if Ollama fails to generate a message
    if [ -z "$GENERATED_MSG" ]; then
        echo "Failed to generate commit message. Please provide one manually."
        echo "Usage: $0 <commit message>"
        exit 1
    else
        echo "Generated commit message: '$GENERATED_MSG'"
        COMMIT_MSG="fix: $GENERATED_MSG"
    fi
else
    # Get the commit message from all command line arguments
    COMMIT_MSG="fix: $*"
fi

# Generate a random branch ID (6 characters)
BRANCH_ID=$(openssl rand -hex 3)
BRANCH_NAME="update-$BRANCH_ID"

# Create branch name with prefix
FULL_BRANCH_NAME="@aerrobert/$BRANCH_NAME"

# All files are already staged at the beginning of the script

# Create and checkout new branch
echo "Creating branch: $FULL_BRANCH_NAME"
git checkout -b "$FULL_BRANCH_NAME"

# Commit changes
echo "Committing with message: $COMMIT_MSG"
git add -A
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin "$FULL_BRANCH_NAME"

# Create PR using GitHub CLI
echo "Creating PR..."
PR_URL=$(gh pr create --title "$COMMIT_MSG" --body "Auto-generated PR from script")

# Enable auto-merge without merging
echo "Enabling auto-merge..."
gh pr merge "$PR_URL" --auto --delete-branch=false --squash

echo "PR created and auto-merge enabled!"