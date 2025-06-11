#!/bin/bash
# Overwrite the local git repository with a remote URL, purging all local history but keeping the files.

if [ -z "$1" ]; then
  echo "Usage: a here <remote-url>"
  exit 1
fi

REMOTE_URL=$1

if [ -d ".git" ]; then
  echo "Existing git repository found. Removing .git directory..."
  rm -rf .git
fi

git init
git remote add origin $REMOTE_URL
git fetch

echo "Git repository initialized and remote set to $REMOTE_URL"