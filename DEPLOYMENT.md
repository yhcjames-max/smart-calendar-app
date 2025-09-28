# 🚀 Deployment Guide - Swimming Lessons Calendar

This guide will help you deploy your swimming calendar app with the bug fixes to various hosting platforms.

## 📋 Pre-Deployment Checklist

✅ Date booking bug is fixed - lessons now save to correct dates
✅ Today's date is highlighted on the calendar
✅ All files are in the swimming-calendar directory:
- `index.html`
- `styles.css` 
- `script.js`
- `README.md`
- `DEPLOYMENT.md`

## 🌐 GitHub Pages Deployment (Recommended)

### Method 1: Using GitHub Web Interface

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it `smart-calendar-app` (or any name you prefer)
   - Make it public
   - Don't initialize with README (we have our own files)

2. **Upload your files:**
   - Click "uploading an existing file"
   - Drag all files from `/Users/jameschang/swimming-calendar/` into the upload area
   - Add commit message: "Initial commit with bug fixes"
   - Click "Commit new files"

3. **Enable GitHub Pages:**
   - Go to your repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

4. **Access your deployed app:**
   - Your app will be available at: `https://yourusername.github.io/smart-calendar-app/`
   - It may take 5-10 minutes for the first deployment

### Method 2: Using Git Command Line

```bash
# Navigate to your project directory
cd /Users/jameschang/swimming-calendar

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Fixed date booking bug and added today's date highlighting"

# Add GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/smart-calendar-app.git

# Push to GitHub
git branch -M main
git push -u origin main

# Then enable GitHub Pages in repository settings as described above
```

## 🔄 Updating Your Existing Deployment

If you already have the app deployed at https://yhcjames-max.github.io/smart-calendar-app/, here's how to update it:

### Quick Update via GitHub Web Interface

1. Go to your existing repository: https://github.com/yourusername/smart-calendar-app
2. Click on each file (`index.html`, `styles.css`, `script.js`) and click the edit button (pencil icon)
3. Replace the content with the new fixed versions from `/Users/jameschang/swimming-calendar/`
4. Commit each change with message: "Fix date booking bug and add today's date highlighting"
5. Changes will deploy automatically to GitHub Pages in 5-10 minutes

### Update via Git Command Line

```bash
# Navigate to your existing project directory
cd /Users/jameschang/swimming-calendar

# Add to existing git repository
git add .
git commit -m "Fix date booking bug and add today's date highlighting"
git push origin main
```

## 🌟 Alternative Deployment Options

### Netlify Deployment

1. **Via Drag & Drop:**
   - Go to https://app.netlify.com/drop
   - Drag the `/Users/jameschang/swimming-calendar/` folder
   - Your app will be deployed instantly with a random URL

2. **Via GitHub (after GitHub setup):**
   - Go to https://app.netlify.com/
   - Click "New site from Git"
   - Connect to GitHub and select your repository
   - Build settings: Leave empty (static site)
   - Click "Deploy site"

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd /Users/jameschang/swimming-calendar
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - What's your project's name? `swimming-calendar`
   - In which directory is your code located? `./`

### Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize and deploy:**
   ```bash
   cd /Users/jameschang/swimming-calendar
   firebase login
   firebase init hosting
   firebase deploy
   ```

## 🧪 Local Development Server

For testing before deployment:

### Using Python (if installed)
```bash
cd /Users/jameschang/swimming-calendar
python -m http.server 8000
# Visit http://localhost:8000
```

### Using Node.js
```bash
npx http-server /Users/jameschang/swimming-calendar -p 8000
# Visit http://localhost:8000
```

### Using PHP (if installed)
```bash
cd /Users/jameschang/swimming-calendar
php -S localhost:8000
# Visit http://localhost:8000
```

## 🔧 Key Bug Fixes Included

### 1. Date Booking Fix
- **File**: `script.js` (lines 95-105)
- **Issue**: Lessons were always booking to Sunday
- **Fix**: Proper date formatting and handling in `openModal()` function
- **Result**: Lessons now save to the correct selected date

### 2. Today's Date Highlighting
- **Files**: `script.js` (lines 80-85) and `styles.css` (lines 150-170)
- **Feature**: Current date is highlighted with blue gradient
- **Implementation**: Added `.today` class detection and styling
- **Result**: Users can easily identify today's date

## 📱 Mobile Responsiveness

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch devices with gesture support

## 🔔 Notification Support

The app includes notification reminders:
- Prompts users to enable browser notifications
- Sends reminders 15 minutes before lessons
- Works on desktop and mobile browsers that support notifications

## 🆘 Troubleshooting

### App not loading after deployment
- Check browser console for errors
- Ensure all file paths are correct (case-sensitive on some servers)
- Wait 5-10 minutes for DNS propagation on first deployment

### Date still booking to wrong day
- Clear browser cache and localStorage
- Try in incognito/private browsing mode
- Check that you're using the updated `script.js` file

### Styling not working
- Verify `styles.css` is in the same directory as `index.html`
- Check network tab in browser dev tools to ensure CSS is loading

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all files are uploaded correctly
3. Test in multiple browsers
4. Clear browser cache and try again

---

**Deployment completed successfully!** 🎉

Your swimming calendar with bug fixes should now be live and working correctly.