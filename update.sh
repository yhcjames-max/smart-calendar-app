#!/bin/bash

# Quick Update Script for Swimming Calendar App
# Run this after making any local changes

echo "🏊‍♀️ Swimming Calendar Update Helper"
echo "===================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a Git repository. Make sure you're in the right folder."
    exit 1
fi

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "📝 No changes detected. Nothing to update."
    exit 0
fi

echo "📦 Changes detected! Preparing to update..."

# Show what's changed
echo ""
echo "🔍 Files that will be updated:"
git status --porcelain

echo ""
read -p "📝 Describe your changes (or press Enter for default): " update_message

if [ -z "$update_message" ]; then
    update_message="Updated swimming calendar app"
fi

# Add all changes
echo "📦 Staging changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "$update_message"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push; then
    echo ""
    echo "✅ Update successful!"
    echo "🌐 Your live app will update in 1-2 minutes"
    echo "📱 Check your GitHub Pages URL to see the changes"
else
    echo ""
    echo "❌ Push failed. Check your internet connection and GitHub access."
    exit 1
fi

echo ""
echo "🎉 All done! Your swimming calendar app is now updated online!"



