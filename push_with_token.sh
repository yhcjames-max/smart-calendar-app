#!/bin/bash

# 🏊‍♀️ Push Swimming Calendar Changes to GitHub
# Usage: ./push_with_token.sh YOUR_PERSONAL_ACCESS_TOKEN

if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub Personal Access Token"
    echo "Usage: ./push_with_token.sh YOUR_PERSONAL_ACCESS_TOKEN"
    echo ""
    echo "📋 How to get a token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select 'repo' scope"
    echo "4. Copy the generated token"
    exit 1
fi

TOKEN=$1

echo "🚀 Pushing swimming calendar changes to GitHub..."

# Push with token
if git push https://$TOKEN@github.com/yhcjames-max/smart-calendar-app.git main; then
    echo ""
    echo "🎉 Successfully deployed to GitHub!"
    echo "================================="
    echo "Your changes have been pushed to GitHub."
    echo ""
    echo "🌐 Your app will be updated at:"
    echo "https://yhcjames-max.github.io/smart-calendar-app/"
    echo ""
    echo "⏰ GitHub Pages deployment may take 5-10 minutes."
    echo "You can check deployment status at:"
    echo "https://github.com/yhcjames-max/smart-calendar-app/actions"
else
    echo "❌ Push failed. Please check your token and try again."
fi

