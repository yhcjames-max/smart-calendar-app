#!/bin/bash

# Advanced Swimming Scheduler Update Script
# Run this after making any changes to your advanced scheduler

echo "🏊‍♀️ Advanced Swimming Scheduler Update"
echo "========================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a Git repository. Run deploy-advanced.sh first to set up deployment."
    exit 1
fi

# Check if advanced script exists
if [ ! -f "advanced-script.js" ]; then
    echo "❌ Advanced script not found. Make sure you're in the correct directory."
    exit 1
fi

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "📝 No changes detected. Nothing to update."
    exit 0
fi

echo "📦 Advanced scheduler changes detected!"
echo ""

# Show what's changed
echo "🔍 Files that will be updated:"
git status --porcelain | while read -r line; do
    echo "   $line"
done
echo ""

# Suggest commit message based on changed files
changed_files=$(git diff --name-only --cached 2>/dev/null || git diff --name-only)

# Smart commit message suggestions
if echo "$changed_files" | grep -q "advanced-script.js"; then
    suggested_message="Enhanced scheduling optimization algorithms"
elif echo "$changed_files" | grep -q "styles.css"; then
    suggested_message="Updated UI and mobile responsiveness"
elif echo "$changed_files" | grep -q "index.html"; then
    suggested_message="Improved client management interface"
else
    suggested_message="Updated advanced swimming scheduler features"
fi

echo "💬 Suggested commit messages:"
echo "   1. $suggested_message"
echo "   2. Fixed client geocoding and proximity calculations"
echo "   3. Improved schedule optimization recommendations"
echo "   4. Enhanced mobile user experience"
echo "   5. Updated documentation and help content"
echo "   6. Custom message"
echo ""

read -p "Choose option (1-6) or press Enter for option 1: " choice

case $choice in
    2)
        commit_message="Fixed client geocoding and proximity calculations"
        ;;
    3)
        commit_message="Improved schedule optimization recommendations"
        ;;
    4)
        commit_message="Enhanced mobile user experience"
        ;;
    5)
        commit_message="Updated documentation and help content"
        ;;
    6)
        read -p "Enter your custom message: " commit_message
        if [ -z "$commit_message" ]; then
            commit_message="Updated advanced scheduler"
        fi
        ;;
    *)
        commit_message="$suggested_message"
        ;;
esac

# Add all changes
echo "📦 Staging changes..."
git add .

# Commit changes
echo "💾 Committing changes: $commit_message"
git commit -m "$commit_message"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push; then
    echo ""
    echo "✅ Update successful!"
    echo "🌐 Your live scheduler will update in 1-2 minutes"
    echo ""
    
    # Show deployment URL reminder
    repo_url=$(git remote get-url origin 2>/dev/null)
    if [ -n "$repo_url" ]; then
        # Extract username and repo name from URL
        if [[ $repo_url =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
            username="${BASH_REMATCH[1]}"
            repo_name="${BASH_REMATCH[2]}"
            echo "📱 Check your live app: https://${username}.github.io/${repo_name}"
        fi
    fi
    
    echo ""
    echo "🎯 Advanced Features Updated:"
    
    if echo "$changed_files" | grep -q "advanced-script.js"; then
        echo "   ✅ Optimization algorithms enhanced"
    fi
    if echo "$changed_files" | grep -q "styles.css"; then
        echo "   ✅ User interface improved"
    fi
    if echo "$changed_files" | grep -q "index.html"; then
        echo "   ✅ Client management updated"
    fi
    if echo "$changed_files" | grep -q "README"; then
        echo "   ✅ Documentation refreshed"
    fi
    
else
    echo ""
    echo "❌ Push failed. Common solutions:"
    echo "   1. Check your internet connection"
    echo "   2. Verify GitHub authentication"
    echo "   3. Try: git push origin main --force-with-lease"
    exit 1
fi

echo ""
echo "🏊‍♀️ Your advanced swimming scheduler is now updated!"
echo ""
echo "💡 New features available:"
echo "   🎯 Smart client clustering by location"
echo "   📊 Availability overlap detection"
echo "   🗺️  Automatic address geocoding"
echo "   ⚡ Efficiency scoring for recommendations"
echo "   📱 Enhanced mobile experience"
echo ""
echo "📚 Run 'open README-ADVANCED.md' to learn about all features!"



