class SwimmingCalendar {
    constructor() {
        this.currentDate = new Date();
        this.lessons = this.loadLessons();
        this.currentEditingLesson = null;
        this.notificationPermission = Notification.permission;
        this.scheduledNotifications = new Map();

        this.initializeElements();
        this.bindEvents();
        this.renderCalendar();
        this.renderUpcomingLessons();
        this.checkNotificationPermission();
        this.scheduleNotifications();
    }

    initializeElements() {
        // Calendar elements
        this.monthYearElement = document.getElementById('month-year');
        this.calendarDaysElement = document.getElementById('calendar-days');
        this.prevMonthButton = document.getElementById('prev-month');
        this.nextMonthButton = document.getElementById('next-month');

        // Modal elements
        this.modal = document.getElementById('lesson-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.lessonForm = document.getElementById('lesson-form');
        this.closeButton = document.querySelector('.close');
        this.addLessonButton = document.getElementById('add-lesson-btn');
        this.cancelButton = document.getElementById('cancel-btn');
        this.deleteButton = document.getElementById('delete-btn');

        // Form elements
        this.lessonTitle = document.getElementById('lesson-title');
        this.lessonDate = document.getElementById('lesson-date');
        this.lessonTime = document.getElementById('lesson-time');
        this.lessonDuration = document.getElementById('lesson-duration');
        this.lessonInstructor = document.getElementById('lesson-instructor');
        this.lessonNotes = document.getElementById('lesson-notes');
        this.enableNotification = document.getElementById('enable-notification');

        // Other elements
        this.lessonsListElement = document.getElementById('lessons-list');
        this.notificationBanner = document.getElementById('notification-banner');
        this.enableNotificationsButton = document.getElementById('enable-notifications');
        this.dismissBannerButton = document.getElementById('dismiss-banner');
    }

    bindEvents() {
        // Calendar navigation
        this.prevMonthButton.addEventListener('click', () => this.previousMonth());
        this.nextMonthButton.addEventListener('click', () => this.nextMonth());

        // Modal events
        this.addLessonButton.addEventListener('click', () => this.openAddLessonModal());
        this.closeButton.addEventListener('click', () => this.closeModal());
        this.cancelButton.addEventListener('click', () => this.closeModal());
        this.lessonForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.deleteButton.addEventListener('click', () => this.deleteLesson());

        // Notification events
        this.enableNotificationsButton.addEventListener('click', () => this.requestNotificationPermission());
        this.dismissBannerButton.addEventListener('click', () => this.dismissNotificationBanner());

        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year header
        this.monthYearElement.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);

        // Clear previous calendar days
        this.calendarDaysElement.innerHTML = '';

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Render calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = this.createDayElement(date, month);
            this.calendarDaysElement.appendChild(dayElement);
        }
    }

    createDayElement(date, currentMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();

        // Add classes for styling
        if (date.getMonth() !== currentMonth) {
            dayElement.classList.add('other-month');
        }

        if (this.isToday(date)) {
            dayElement.classList.add('today');
        }

        // Check for lessons on this day
        const lessonsOnDay = this.getLessonsOnDate(date);
        if (lessonsOnDay.length > 0) {
            dayElement.classList.add('has-lesson');
            lessonsOnDay.forEach(lesson => {
                const indicator = document.createElement('span');
                indicator.className = 'lesson-indicator';
                indicator.textContent = lesson.title.substring(0, 10);
                dayElement.appendChild(indicator);
            });
        }

        // Add click handler
        dayElement.addEventListener('click', () => {
            if (lessonsOnDay.length > 0) {
                this.openEditLessonModal(lessonsOnDay[0]);
            } else {
                this.openAddLessonModal(date);
            }
        });

        return dayElement;
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getLessonsOnDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.lessons.filter(lesson => lesson.date === dateString);
    }

    openAddLessonModal(date = null) {
        this.currentEditingLesson = null;
        this.modalTitle.textContent = 'Add Swimming Lesson';
        this.deleteButton.style.display = 'none';
        
        // Reset form
        this.lessonForm.reset();
        this.lessonDuration.value = 60;
        
        // Set date if provided
        if (date) {
            this.lessonDate.value = date.toISOString().split('T')[0];
        }
        
        this.modal.style.display = 'block';
    }

    openEditLessonModal(lesson) {
        this.currentEditingLesson = lesson;
        this.modalTitle.textContent = 'Edit Swimming Lesson';
        this.deleteButton.style.display = 'inline-block';
        
        // Populate form
        this.lessonTitle.value = lesson.title;
        this.lessonDate.value = lesson.date;
        this.lessonTime.value = lesson.time;
        this.lessonDuration.value = lesson.duration;
        this.lessonInstructor.value = lesson.instructor || '';
        this.lessonNotes.value = lesson.notes || '';
        this.enableNotification.checked = lesson.notification || false;
        
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.currentEditingLesson = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const lessonData = {
            id: this.currentEditingLesson ? this.currentEditingLesson.id : this.generateId(),
            title: this.lessonTitle.value.trim(),
            date: this.lessonDate.value,
            time: this.lessonTime.value,
            duration: parseInt(this.lessonDuration.value),
            instructor: this.lessonInstructor.value.trim(),
            notes: this.lessonNotes.value.trim(),
            notification: this.enableNotification.checked,
            created: this.currentEditingLesson ? this.currentEditingLesson.created : Date.now()
        };

        if (this.currentEditingLesson) {
            this.updateLesson(lessonData);
        } else {
            this.addLesson(lessonData);
        }

        this.saveLessons();
        this.renderCalendar();
        this.renderUpcomingLessons();
        this.scheduleNotifications();
        this.closeModal();
    }

    addLesson(lesson) {
        this.lessons.push(lesson);
        this.showNotification('Lesson added successfully!', 'success');
    }

    updateLesson(updatedLesson) {
        const index = this.lessons.findIndex(lesson => lesson.id === updatedLesson.id);
        if (index !== -1) {
            this.lessons[index] = updatedLesson;
            this.showNotification('Lesson updated successfully!', 'success');
        }
    }

    deleteLesson() {
        if (this.currentEditingLesson && confirm('Are you sure you want to delete this lesson?')) {
            this.lessons = this.lessons.filter(lesson => lesson.id !== this.currentEditingLesson.id);
            this.saveLessons();
            this.renderCalendar();
            this.renderUpcomingLessons();
            this.scheduleNotifications();
            this.closeModal();
            this.showNotification('Lesson deleted successfully!', 'success');
        }
    }

    renderUpcomingLessons() {
        const now = new Date();
        const upcomingLessons = this.lessons
            .filter(lesson => {
                const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
                return lessonDateTime >= now;
            })
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
            .slice(0, 5);

        this.lessonsListElement.innerHTML = '';

        if (upcomingLessons.length === 0) {
            this.lessonsListElement.innerHTML = '<p style="text-align: center; color: #6c757d;">No upcoming lessons scheduled.</p>';
            return;
        }

        upcomingLessons.forEach(lesson => {
            const lessonElement = this.createLessonElement(lesson);
            this.lessonsListElement.appendChild(lessonElement);
        });
    }

    createLessonElement(lesson) {
        const lessonElement = document.createElement('div');
        lessonElement.className = 'lesson-item';
        lessonElement.style.cursor = 'pointer';

        const lessonDate = new Date(lesson.date);
        const lessonTime = lesson.time;
        const formattedDate = lessonDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        lessonElement.innerHTML = `
            <div class="lesson-title">${lesson.title}</div>
            <div class="lesson-details">
                📅 ${formattedDate} at ${this.formatTime(lessonTime)}<br>
                ⏱️ Duration: ${lesson.duration} minutes<br>
                ${lesson.instructor ? `👨‍🏫 Instructor: ${lesson.instructor}<br>` : ''}
                ${lesson.notes ? `📝 ${lesson.notes}` : ''}
            </div>
        `;

        lessonElement.addEventListener('click', () => {
            this.openEditLessonModal(lesson);
        });

        return lessonElement;
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    loadLessons() {
        try {
            const savedLessons = localStorage.getItem('swimming-lessons');
            return savedLessons ? JSON.parse(savedLessons) : [];
        } catch (error) {
            console.error('Error loading lessons:', error);
            return [];
        }
    }

    saveLessons() {
        try {
            localStorage.setItem('swimming-lessons', JSON.stringify(this.lessons));
        } catch (error) {
            console.error('Error saving lessons:', error);
        }
    }

    // Notification System
    checkNotificationPermission() {
        if (Notification.permission === 'default') {
            this.notificationBanner.style.display = 'flex';
        }
    }

    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            
            if (permission === 'granted') {
                this.dismissNotificationBanner();
                this.showNotification('Notifications enabled! You\'ll receive reminders for your lessons.', 'success');
                this.scheduleNotifications();
            } else {
                this.showNotification('Notifications were denied. You can enable them in your browser settings.', 'warning');
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    dismissNotificationBanner() {
        this.notificationBanner.style.display = 'none';
        localStorage.setItem('notification-banner-dismissed', 'true');
    }

    scheduleNotifications() {
        // Clear existing scheduled notifications
        this.scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
        this.scheduledNotifications.clear();

        if (Notification.permission !== 'granted') return;

        const now = new Date();
        
        this.lessons
            .filter(lesson => lesson.notification)
            .forEach(lesson => {
                const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
                const reminderTime = new Date(lessonDateTime.getTime() - 15 * 60 * 1000); // 15 minutes before

                if (reminderTime > now) {
                    const timeUntilReminder = reminderTime.getTime() - now.getTime();
                    
                    const timeoutId = setTimeout(() => {
                        this.showLessonNotification(lesson);
                    }, timeUntilReminder);

                    this.scheduledNotifications.set(lesson.id, timeoutId);
                }
            });
    }

    showLessonNotification(lesson) {
        if (Notification.permission === 'granted') {
            const notification = new Notification('Swimming Lesson Reminder', {
                body: `Your lesson "${lesson.title}" starts in 15 minutes!`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50">🏊‍♀️</text></svg>',
                tag: lesson.id,
                requireInteraction: true
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    showNotification(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// CSS animations for toast notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SwimmingCalendar();
});
