#!/bin/bash
# Quick git add, commit, and push with either: user-provided commit message if arguments are given or auto-generated commit message from Ollama if no arguments are given

if [ $# -eq 0 ]; then
  # Generate a commit message using Ollama
  echo "Generating commit message using Ollama..."

  # Build the prompt string
  PROMPT="Generate a concise, meaningful git commit message (max 50 chars) from this diff. Focus on the 'what' and 'why'. Give each commit both a prefix like 'feat:' or 'refactor:' or 'fix:' or 'docs:' or 'chore:' and a few words of description. Format: just the commit message with no quotes:"
  
  # Get the git diff and store it
  DIFF=$(git diff)

  # Stage all changes first so they're included in the diff
  git add -A
  STATUS=$(git status)
  
  # Print the prompt
  PROMPT=$(echo -e "$DIFF\n\n------------------------------------------------------------------------\n\n$STATUS\n\n------------------------------------------------------------------------\n\n$PROMPT\n\n")

  # Combine prompt and diff, then pipe to Ollama
  COMMIT_MSG=$(echo -e "$PROMPT" | ollama run gemma3 | head -n 1)
  COMMIT_MSG="$COMMIT_MSG (ai-summary)"

  # Fallback if Ollama fails to generate a message
  if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Pushing changes"
    echo "Failed to generate commit message, using default: '$COMMIT_MSG'"
  else
    echo "Generated commit message: '$COMMIT_MSG'"
  fi
else
  git add -A
  COMMIT_MSG="$*"
fi

git commit -m "$COMMIT_MSG"
git push