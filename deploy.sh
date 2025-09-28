#!/bin/bash

# 🏊‍♀️ Swimming Calendar - Deployment Script
# This script helps deploy your fixed swimming calendar to GitHub Pages

echo "🏊‍♀️ Swimming Calendar Deployment Script"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "script.js" ] || [ ! -f "styles.css" ]; then
    echo "❌ Error: Missing required files. Please run this script from the swimming-calendar directory."
    exit 1
fi

echo "✅ Required files found!"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    echo "✅ Git repository initialized!"
else
    echo "✅ Git repository already exists!"
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit with bug fix message
echo "💾 Committing changes..."
git commit -m "Fix date booking bug and add today's date highlighting - Swimming Calendar v2.0

- Fixed bug where lessons were booking to Sunday instead of selected date
- Added today's date highlighting with blue gradient
- Improved date handling in modal and save functions
- Enhanced calendar visual indicators
- Mobile responsive design
- Notification support for lesson reminders"

echo "✅ Files committed successfully!"

# Prompt for GitHub repository URL
echo ""
echo "🌐 GitHub Deployment Setup"
echo "=========================="
echo "Please provide your GitHub repository URL (e.g., https://github.com/yourusername/smart-calendar-app.git):"
read -p "Repository URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "⚠️  No repository URL provided. Skipping GitHub push."
    echo "📋 Manual steps to deploy:"
    echo "1. Create a repository on GitHub"
    echo "2. Run: git remote add origin YOUR_REPO_URL"
    echo "3. Run: git branch -M main"
    echo "4. Run: git push -u origin main"
    echo "5. Enable GitHub Pages in repository settings"
else
    # Add remote origin if it doesn't exist
    if ! git remote get-url origin &> /dev/null; then
        echo "🔗 Adding GitHub remote..."
        git remote add origin "$repo_url"
    else
        echo "🔗 Updating GitHub remote..."
        git remote set-url origin "$repo_url"
    fi

    # Set main branch and push
    echo "🚀 Deploying to GitHub..."
    git branch -M main
    
    if git push -u origin main; then
        echo ""
        echo "🎉 Deployment successful!"
        echo "================================"
        echo "Your swimming calendar with bug fixes has been deployed!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Go to your GitHub repository settings"
        echo "2. Navigate to 'Pages' section"
        echo "3. Under 'Source', select 'Deploy from a branch'"
        echo "4. Choose 'main' branch and '/ (root)' folder"
        echo "5. Click 'Save'"
        echo ""
        echo "🌐 Your app will be available at:"
        repo_name=$(basename "$repo_url" .git)
        github_username=$(echo "$repo_url" | sed -n 's/.*github.com\/\([^\/]*\)\/.*/\1/p')
        echo "https://${github_username}.github.io/${repo_name}/"
        echo ""
        echo "⏰ It may take 5-10 minutes for the deployment to go live."
    else
        echo "❌ Push failed. Please check your repository URL and GitHub authentication."
        echo "💡 You may need to:"
        echo "1. Set up GitHub authentication (SSH key or personal access token)"
        echo "2. Create the repository on GitHub first"
        echo "3. Check that the repository URL is correct"
    fi
fi

echo ""
echo "📊 Bug Fixes Summary:"
echo "===================="
echo "✅ Fixed date booking bug - lessons now save to correct dates"
echo "✅ Added today's date highlighting on calendar"
echo "✅ Improved date handling and validation"
echo "✅ Enhanced mobile responsiveness"
echo "✅ Added notification reminder support"
echo ""
echo "📱 Test your app by:"
echo "1. Opening the deployed URL"
echo "2. Clicking on different calendar dates"
echo "3. Verifying lessons save to the correct dates"
echo "4. Checking that today's date is highlighted"
echo ""
echo "🏊‍♀️ Happy swimming lesson planning!"