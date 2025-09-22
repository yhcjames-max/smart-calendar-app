# 🏊‍♀️ Swimming Lessons Calendar

A beautiful, responsive web application for managing swimming lesson schedules with calendar visualization and notification reminders.

## Features

✅ **Fixed Issues:**
- **Date Booking Bug Fixed**: Lessons now correctly book to the selected calendar date instead of defaulting to Sunday
- **Today's Date Indication**: Current date is clearly highlighted on the calendar with a special blue gradient style

🏊‍♀️ **Core Features:**
- Interactive calendar view with month navigation
- Add, edit, and delete swimming lessons
- Upcoming lessons list with next 5 scheduled lessons
- Notification reminders 15 minutes before lessons
- Responsive design for mobile and desktop
- Local storage for data persistence
- Beautiful gradient UI with hover effects

## Quick Start

1. Open `index.html` in your web browser
2. Click on any calendar date to add a swimming lesson
3. Fill in lesson details and save
4. Enable notifications for lesson reminders

## Key Fixes Implemented

### 1. Date Booking Bug Fix
- **Problem**: All lessons were booking to Sunday slots regardless of selected date
- **Solution**: Proper date handling in the `openModal()` and `saveLesson()` functions
- **Implementation**: 
  - Fixed date formatting to use ISO string format (YYYY-MM-DD)
  - Ensured selected date is correctly passed to the modal
  - Proper date parsing and storage in lesson data

### 2. Today's Date Indication
- **Implementation**: Added special CSS class `.today` for current date
- **Visual Design**: Blue gradient background with white text and rounded day number
- **Real-time**: Updates automatically when the date changes

## File Structure

```
swimming-calendar/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── script.js           # JavaScript functionality with bug fixes
├── README.md           # This documentation
└── DEPLOYMENT.md       # Deployment instructions
```

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Deployment Options

See `DEPLOYMENT.md` for detailed deployment instructions for:
- GitHub Pages
- Netlify
- Vercel
- Local development server

## Data Storage

The application uses browser's localStorage to persist lesson data. Data is automatically saved when you add, edit, or delete lessons.

## Notifications

The app supports browser notifications for lesson reminders. Users will be prompted to enable notifications, and reminders will be sent 15 minutes before each lesson.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your swimming lesson management needs!

---

**Last Updated**: September 22, 2025
**Version**: 2.0 (Bug fixes and improvements)