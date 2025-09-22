class SwimmingCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.selectedDate = null;
        this.lessons = JSON.parse(localStorage.getItem('swimmingLessons')) || [];
        this.editingLessonId = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCalendar();
        this.renderUpcomingLessons();
        this.checkNotificationPermission();
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        
        // Add lesson button
        document.getElementById('addLessonBtn').addEventListener('click', () => this.openModal());
        
        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteLesson());
        
        // Form submission
        document.getElementById('lessonForm').addEventListener('submit', (e) => this.saveLesson(e));
        
        // Notification banner events
        document.getElementById('enableNotificationsBtn').addEventListener('click', () => this.requestNotificationPermission());
        document.getElementById('dismissBanner').addEventListener('click', () => this.dismissNotificationBanner());
        
        // Close modal when clicking outside
        document.getElementById('lessonModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('lessonModal')) {
                this.closeModal();
            }
        });
    }

    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('currentMonthYear');
        
        // Set month/year display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        monthYear.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Clear previous calendar
        grid.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Get previous month info for leading days
        const prevMonth = new Date(this.currentYear, this.currentMonth - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        // Create calendar days
        let dayCount = 1;
        let nextMonthDay = 1;
        
        // Calculate total cells needed (6 weeks)
        const totalCells = 42;
        
        for (let i = 0; i < totalCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            let dayNumber;
            let currentDateForDay;
            let isCurrentMonth = true;
            
            if (i < startingDayOfWeek) {
                // Previous month days
                dayNumber = daysInPrevMonth - startingDayOfWeek + i + 1;
                dayElement.classList.add('other-month');
                currentDateForDay = new Date(this.currentYear, this.currentMonth - 1, dayNumber);
                isCurrentMonth = false;
            } else if (dayCount <= daysInMonth) {
                // Current month days
                dayNumber = dayCount;
                currentDateForDay = new Date(this.currentYear, this.currentMonth, dayNumber);
                dayCount++;
            } else {
                // Next month days
                dayNumber = nextMonthDay;
                dayElement.classList.add('other-month');
                currentDateForDay = new Date(this.currentYear, this.currentMonth + 1, dayNumber);
                nextMonthDay++;
                isCurrentMonth = false;
            }
            
            // Check if this is today
            const today = new Date();
            if (currentDateForDay.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Add day number
            const dayNumberElement = document.createElement('div');
            dayNumberElement.className = 'day-number';
            dayNumberElement.textContent = dayNumber;
            dayElement.appendChild(dayNumberElement);
            
            // Add lessons for this day
            const dayLessons = this.getLessonsForDate(currentDateForDay);
            dayLessons.forEach(lesson => {
                const lessonElement = document.createElement('div');
                lessonElement.className = 'lesson-indicator';
                lessonElement.textContent = lesson.title;
                lessonElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editLesson(lesson.id);
                });
                dayElement.appendChild(lessonElement);
            });
            
            // Add click handler for day selection
            dayElement.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.calendar-day').forEach(day => {
                    day.classList.remove('selected');
                });
                
                // Add selection to current day
                dayElement.classList.add('selected');
                this.selectedDate = currentDateForDay;
                
                // Open modal for adding lesson
                this.openModal(currentDateForDay);
            });
            
            grid.appendChild(dayElement);
        }
    }

    getLessonsForDate(date) {
        return this.lessons.filter(lesson => {
            const lessonDate = new Date(lesson.date);
            return lessonDate.toDateString() === date.toDateString();
        });
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
    }

    openModal(selectedDate = null) {
        const modal = document.getElementById('lessonModal');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteBtn');
        
        // Reset form
        document.getElementById('lessonForm').reset();
        document.getElementById('lessonDuration').value = 60;
        this.editingLessonId = null;
        
        if (selectedDate) {
            // Format date for input (YYYY-MM-DD)
            const formattedDate = selectedDate.toISOString().split('T')[0];
            document.getElementById('lessonDate').value = formattedDate;
            modalTitle.textContent = 'Add Swimming Lesson';
            deleteBtn.style.display = 'none';
        } else {
            modalTitle.textContent = 'Add Swimming Lesson';
            deleteBtn.style.display = 'none';
            
            // Set today's date as default
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('lessonDate').value = formattedDate;
        }
        
        modal.style.display = 'block';
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('lessonTitle').focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('lessonModal');
        modal.style.display = 'none';
        this.editingLessonId = null;
        
        // Clear selection
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        this.selectedDate = null;
    }

    saveLesson(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const lessonData = {
            id: this.editingLessonId || Date.now().toString(),
            title: document.getElementById('lessonTitle').value,
            date: document.getElementById('lessonDate').value,
            time: document.getElementById('lessonTime').value,
            duration: parseInt(document.getElementById('lessonDuration').value),
            instructor: document.getElementById('lessonInstructor').value,
            notes: document.getElementById('lessonNotes').value,
            notification: document.getElementById('enableNotification').checked
        };

        if (this.editingLessonId) {
            // Update existing lesson
            const index = this.lessons.findIndex(lesson => lesson.id === this.editingLessonId);
            if (index !== -1) {
                this.lessons[index] = lessonData;
            }
        } else {
            // Add new lesson
            this.lessons.push(lessonData);
        }

        // Save to localStorage
        localStorage.setItem('swimmingLessons', JSON.stringify(this.lessons));
        
        // Schedule notification if enabled
        if (lessonData.notification && 'Notification' in window && Notification.permission === 'granted') {
            this.scheduleNotification(lessonData);
        }
        
        // Re-render calendar and lessons list
        this.renderCalendar();
        this.renderUpcomingLessons();
        this.closeModal();
    }

    editLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        this.editingLessonId = lessonId;
        
        // Populate form
        document.getElementById('lessonTitle').value = lesson.title;
        document.getElementById('lessonDate').value = lesson.date;
        document.getElementById('lessonTime').value = lesson.time;
        document.getElementById('lessonDuration').value = lesson.duration;
        document.getElementById('lessonInstructor').value = lesson.instructor;
        document.getElementById('lessonNotes').value = lesson.notes || '';
        document.getElementById('enableNotification').checked = lesson.notification || false;
        
        // Update modal title and show delete button
        document.getElementById('modalTitle').textContent = 'Edit Swimming Lesson';
        document.getElementById('deleteBtn').style.display = 'block';
        document.getElementById('lessonModal').style.display = 'block';
    }

    deleteLesson() {
        if (!this.editingLessonId) return;
        
        if (confirm('Are you sure you want to delete this swimming lesson?')) {
            this.lessons = this.lessons.filter(lesson => lesson.id !== this.editingLessonId);
            localStorage.setItem('swimmingLessons', JSON.stringify(this.lessons));
            
            this.renderCalendar();
            this.renderUpcomingLessons();
            this.closeModal();
        }
    }

    renderUpcomingLessons() {
        const lessonsList = document.getElementById('lessonsList');
        
        // Filter and sort upcoming lessons
        const now = new Date();
        const upcomingLessons = this.lessons
            .filter(lesson => new Date(lesson.date + 'T' + lesson.time) >= now)
            .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
            .slice(0, 5); // Show only next 5 lessons

        if (upcomingLessons.length === 0) {
            lessonsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No upcoming lessons scheduled.</p>';
            return;
        }

        lessonsList.innerHTML = '';
        upcomingLessons.forEach(lesson => {
            const lessonCard = document.createElement('div');
            lessonCard.className = 'lesson-card';
            lessonCard.addEventListener('click', () => this.editLesson(lesson.id));

            const lessonDate = new Date(lesson.date);
            const formattedDate = lessonDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            lessonCard.innerHTML = `
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-details">
                    <strong>Date:</strong> ${formattedDate}<br>
                    <strong>Time:</strong> ${lesson.time}<br>
                    <strong>Duration:</strong> ${lesson.duration} minutes<br>
                    <strong>Instructor:</strong> ${lesson.instructor}
                    ${lesson.notes ? `<br><strong>Notes:</strong> ${lesson.notes}` : ''}
                </div>
            `;

            lessonsList.appendChild(lessonCard);
        });
    }

    scheduleNotification(lesson) {
        const lessonDateTime = new Date(lesson.date + 'T' + lesson.time);
        const notificationTime = new Date(lessonDateTime.getTime() - 15 * 60 * 1000); // 15 minutes before
        const now = new Date();

        if (notificationTime > now) {
            const timeUntilNotification = notificationTime.getTime() - now.getTime();
            
            setTimeout(() => {
                new Notification('Swimming Lesson Reminder', {
                    body: `Your lesson "${lesson.title}" with ${lesson.instructor} starts in 15 minutes!`,
                    icon: '🏊‍♀️',
                    badge: '🏊‍♀️'
                });
            }, timeUntilNotification);
        }
    }

    checkNotificationPermission() {
        const banner = document.getElementById('notificationBanner');
        
        if ('Notification' in window) {
            if (Notification.permission === 'denied' || 
                localStorage.getItem('notificationBannerDismissed') === 'true') {
                banner.style.display = 'none';
            } else if (Notification.permission === 'granted') {
                banner.style.display = 'none';
            } else {
                banner.style.display = 'flex';
            }
        } else {
            banner.style.display = 'none';
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    document.getElementById('notificationBanner').style.display = 'none';
                    
                    // Show confirmation notification
                    new Notification('Swimming Calendar', {
                        body: 'Notifications enabled! You\'ll receive reminders 15 minutes before your lessons.',
                        icon: '🏊‍♀️'
                    });
                }
            });
        }
    }

    dismissNotificationBanner() {
        document.getElementById('notificationBanner').style.display = 'none';
        localStorage.setItem('notificationBannerDismissed', 'true');
    }
}

// Initialize the calendar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SwimmingCalendar();
});