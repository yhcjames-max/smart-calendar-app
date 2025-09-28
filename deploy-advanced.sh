#!/bin/bash

# Advanced Swimming Instructor Scheduler Deployment Script
# This script helps you deploy the enhanced scheduling optimization app

echo "🏊‍♀️ Advanced Swimming Instructor Scheduler Deployment"
echo "===================================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Visit: https://git-scm.com/downloads"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "advanced-script.js" ]; then
    echo "❌ advanced-script.js not found. Make sure you're in the swimming-calendar directory."
    exit 1
fi

echo "🔍 Pre-deployment checks..."
echo "✅ Git is installed"
echo "✅ In correct directory"
echo "✅ Advanced script file found"
echo ""

# Verify all required files exist
required_files=("index.html" "styles.css" "advanced-script.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    printf '   - %s\n' "${missing_files[@]}"
    exit 1
fi

echo "✅ All required files present"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized!"
    echo ""
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📄 Creating .gitignore file..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log

# Temporary files
*.tmp
*.temp

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.production
EOF
    echo "✅ .gitignore created"
    echo ""
fi

# Show files to be deployed
echo "📦 Files ready for deployment:"
echo "   - index.html (Main application)"
echo "   - styles.css (Modern responsive styling)"
echo "   - advanced-script.js (Advanced scheduling engine)"
echo "   - README-ADVANCED.md (Comprehensive documentation)"
echo "   - QUICK-DEPLOY.md (Quick deployment guide)"
echo "   - DEPLOYMENT.md (Full deployment options)"
echo ""

# Add all files
echo "📦 Staging files for deployment..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "📝 No changes detected. Repository is up to date."
    echo ""
else
    echo "📝 Changes detected and staged!"
    echo ""
    
    # Show what will be committed
    echo "🔍 Files to be committed:"
    git diff --cached --name-only | sed 's/^/   - /'
    echo ""
fi

# Get commit message
echo "💬 Describe your changes:"
echo "   1. Initial deployment of advanced scheduler"
echo "   2. Updated client management features"
echo "   3. Added schedule optimization engine"
echo "   4. Enhanced UI and mobile support"
echo "   5. Custom message"
echo ""
read -p "Choose an option (1-5) or press Enter for option 1: " choice

case $choice in
    2)
        commit_message="Updated client management features with availability tracking"
        ;;
    3)
        commit_message="Added intelligent schedule optimization with proximity clustering"
        ;;
    4)
        commit_message="Enhanced UI with mobile support and responsive design"
        ;;
    5)
        read -p "Enter your custom commit message: " commit_message
        if [ -z "$commit_message" ]; then
            commit_message="Updated advanced swimming scheduler"
        fi
        ;;
    *)
        commit_message="Initial deployment of advanced swimming instructor scheduler"
        ;;
esac

# Commit changes
if ! git diff --cached --quiet; then
    echo "💾 Committing changes..."
    git commit -m "$commit_message"
    echo "✅ Changes committed successfully!"
    echo ""
else
    echo "📝 No new changes to commit"
    echo ""
fi

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    echo "🚀 Pushing to existing repository..."
    if git push origin main || git push origin master; then
        echo "✅ Successfully pushed to repository!"
        echo ""
    else
        echo "❌ Push failed. Check your GitHub connection and try again."
        exit 1
    fi
else
    echo "🌐 Setting up GitHub deployment:"
    echo ""
    echo "To deploy your advanced scheduler to GitHub Pages:"
    echo ""
    echo "1. 📂 Create a new repository on GitHub.com"
    echo "2. 📝 Name it something like 'swimming-scheduler' or 'instructor-app'"
    echo "3. ✅ Make it Public (required for free GitHub Pages)"
    echo "4. 📋 Copy the repository URL"
    echo ""
    
    read -p "Do you want to add your GitHub repository now? (y/n): " add_remote
    
    if [ "$add_remote" = "y" ] || [ "$add_remote" = "Y" ]; then
        read -p "Enter your GitHub repository URL: " repo_url
        
        if [ -n "$repo_url" ]; then
            echo "🔗 Adding remote repository..."
            git remote add origin "$repo_url"
            
            echo "🚀 Pushing to GitHub..."
            if git push -u origin main || git push -u origin master; then
                echo "✅ Successfully deployed to GitHub!"
                echo ""
            else
                echo "❌ Push failed. Please check your repository URL and try again."
                exit 1
            fi
        else
            echo "❌ No repository URL provided. Skipping remote setup."
        fi
    fi
fi

# Enable GitHub Pages instructions
echo "🌐 NEXT STEP: Enable GitHub Pages"
echo "=================================="
echo ""
echo "1. 🌐 Go to your GitHub repository online"
echo "2. ⚙️  Click 'Settings' tab"
echo "3. 📄 Scroll to 'Pages' in the left sidebar"
echo "4. 🔧 Under 'Source', select 'Deploy from a branch'"
echo "5. 🌿 Choose 'main' branch (or 'master')"
echo "6. 📁 Select '/ (root)' folder"
echo "7. 💾 Click 'Save'"
echo ""
echo "🎉 Your advanced swimming scheduler will be live at:"
echo "    https://yourusername.github.io/yourrepositoryname"
echo ""
echo "⏱️  Note: It may take 5-10 minutes to become available"
echo ""

# Feature summary
echo "🎯 YOUR ADVANCED SCHEDULER FEATURES:"
echo "======================================"
echo ""
echo "✅ Intelligent Client Management"
echo "   - Client profiles with full address"
echo "   - Weekly availability tracking"
echo "   - Skill level management"
echo ""
echo "✅ Geographic Optimization"
echo "   - Automatic address geocoding"
echo "   - Distance calculations"
echo "   - Client clustering by proximity"
echo ""
echo "✅ Smart Scheduling"
echo "   - Availability overlap detection"
echo "   - Efficiency scoring"
echo "   - Group lesson recommendations"
echo ""
echo "✅ Professional Features"
echo "   - Mobile-optimized interface"
echo "   - Offline capability"
echo "   - Data export/import"
echo "   - Notification reminders"
echo ""

# Success message
echo "🎊 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "Your advanced swimming instructor scheduler is ready!"
echo ""
echo "📚 Read README-ADVANCED.md for detailed feature information"
echo "🚀 Check QUICK-DEPLOY.md for deployment troubleshooting"
echo "🔧 Visit DEPLOYMENT.md for alternative hosting options"
echo ""
echo "🏊‍♀️ Start optimizing your swimming lessons today!"
echo ""

# Offer to open documentation
read -p "Would you like to view the advanced features documentation? (y/n): " view_docs
if [ "$view_docs" = "y" ] || [ "$view_docs" = "Y" ]; then
    if command -v open &> /dev/null; then
        open README-ADVANCED.md 2>/dev/null || echo "Please open README-ADVANCED.md manually"
    elif command -v xdg-open &> /dev/null; then
        xdg-open README-ADVANCED.md 2>/dev/null || echo "Please open README-ADVANCED.md manually"
    else
        echo "Please open README-ADVANCED.md to learn about all the new features!"
    fi
fi

echo ""
echo "✨ Happy scheduling! 🏊‍♀️"



