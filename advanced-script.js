class AdvancedSwimmingScheduler {
    constructor() {
        this.currentDate = new Date();
        this.lessons = this.loadLessons();
        this.clients = this.loadClients();
        this.currentEditingLesson = null;
        this.currentEditingClient = null;
        this.notificationPermission = Notification.permission;
        this.scheduledNotifications = new Map();

        // Geocoding cache to avoid repeated API calls
        this.geocodeCache = this.loadGeocodeCache();
        
        // Initialize UI
        this.initializeElements();
        this.bindEvents();
        this.renderCalendar();
        this.renderClients();
        this.renderUpcomingLessons();
        this.renderRecommendations();
        this.checkNotificationPermission();
        this.scheduleNotifications();
    }

    initializeElements() {
        // Calendar elements
        this.monthYearElement = document.getElementById('month-year');
        this.calendarDaysElement = document.getElementById('calendar-days');
        this.prevMonthButton = document.getElementById('prev-month');
        this.nextMonthButton = document.getElementById('next-month');

        // Header buttons
        this.addClientButton = document.getElementById('add-client-btn');
        this.addLessonButton = document.getElementById('add-lesson-btn');
        this.optimizeScheduleButton = document.getElementById('optimize-schedule-btn');

        // Modal elements - Lesson
        this.lessonModal = document.getElementById('lesson-modal');
        this.lessonModalTitle = document.getElementById('modal-title');
        this.lessonForm = document.getElementById('lesson-form');
        this.cancelButton = document.getElementById('cancel-btn');
        this.deleteButton = document.getElementById('delete-btn');

        // Modal elements - Client
        this.clientModal = document.getElementById('client-modal');
        this.clientModalTitle = document.getElementById('client-modal-title');
        this.clientForm = document.getElementById('client-form');
        this.deleteClientButton = document.getElementById('delete-client-btn');

        // Modal elements - Optimization
        this.optimizationModal = document.getElementById('optimization-modal');
        this.optimizationResults = document.getElementById('optimization-results');
        this.applyRecommendationsButton = document.getElementById('apply-recommendations');

        // Form elements - Lesson
        this.lessonTitle = document.getElementById('lesson-title');
        this.lessonDate = document.getElementById('lesson-date');
        this.lessonTime = document.getElementById('lesson-time');
        this.lessonDuration = document.getElementById('lesson-duration');
        this.lessonInstructor = document.getElementById('lesson-instructor');
        this.lessonNotes = document.getElementById('lesson-notes');
        this.enableNotification = document.getElementById('enable-notification');

        // Form elements - Client
        this.clientName = document.getElementById('client-name');
        this.clientEmail = document.getElementById('client-email');
        this.clientPhone = document.getElementById('client-phone');
        this.clientAddress = document.getElementById('client-address');
        this.clientSkillLevel = document.getElementById('client-skill-level');
        this.clientNotes = document.getElementById('client-notes');

        // Dashboard elements
        this.clientsListElement = document.getElementById('clients-list');
        this.recommendationsListElement = document.getElementById('recommendations-list');
        this.lessonsListElement = document.getElementById('lessons-list');

        // Notification elements
        this.notificationBanner = document.getElementById('notification-banner');
        this.enableNotificationsButton = document.getElementById('enable-notifications');
        this.dismissBannerButton = document.getElementById('dismiss-banner');
    }

    bindEvents() {
        // Calendar navigation
        this.prevMonthButton.addEventListener('click', () => this.previousMonth());
        this.nextMonthButton.addEventListener('click', () => this.nextMonth());

        // Header buttons
        this.addClientButton.addEventListener('click', () => this.openAddClientModal());
        this.addLessonButton.addEventListener('click', () => this.openAddLessonModal());
        this.optimizeScheduleButton.addEventListener('click', () => this.runScheduleOptimization());

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.getAttribute('data-modal');
                if (modal) {
                    this.closeModal(modal);
                } else {
                    this.closeAllModals();
                }
            });
        });

        // Form submissions
        this.lessonForm.addEventListener('submit', (e) => this.handleLessonFormSubmit(e));
        this.clientForm.addEventListener('submit', (e) => this.handleClientFormSubmit(e));

        // Action buttons
        this.cancelButton.addEventListener('click', () => this.closeModal('lesson'));
        this.deleteButton.addEventListener('click', () => this.deleteLesson());
        this.deleteClientButton.addEventListener('click', () => this.deleteClient());
        this.applyRecommendationsButton.addEventListener('click', () => this.applyOptimizationRecommendations());

        // Generic cancel buttons
        document.querySelectorAll('[data-action="cancel-client"]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal('client'));
        });
        
        document.querySelectorAll('[data-action="close-optimization"]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal('optimization'));
        });

        // Notification events
        this.enableNotificationsButton.addEventListener('click', () => this.requestNotificationPermission());
        this.dismissBannerButton.addEventListener('click', () => this.dismissNotificationBanner());

        // Modal outside click
        [this.lessonModal, this.clientModal, this.optimizationModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Calendar Methods
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
        
        this.monthYearElement.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);

        this.calendarDaysElement.innerHTML = '';

        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

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

        if (date.getMonth() !== currentMonth) {
            dayElement.classList.add('other-month');
        }

        if (this.isToday(date)) {
            dayElement.classList.add('today');
        }

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

    // Client Management Methods
    openAddClientModal() {
        this.currentEditingClient = null;
        this.clientModalTitle.textContent = 'Add Client';
        this.deleteClientButton.style.display = 'none';
        this.clientForm.reset();
        this.clearClientAvailability();
        this.clientModal.style.display = 'block';
    }

    openEditClientModal(client) {
        this.currentEditingClient = client;
        this.clientModalTitle.textContent = 'Edit Client';
        this.deleteClientButton.style.display = 'inline-block';
        
        // Populate form
        this.clientName.value = client.name;
        this.clientEmail.value = client.email || '';
        this.clientPhone.value = client.phone || '';
        this.clientAddress.value = client.address;
        this.clientSkillLevel.value = client.skillLevel;
        this.clientNotes.value = client.notes || '';
        
        // Set availability checkboxes
        this.setClientAvailability(client.availability);
        
        this.clientModal.style.display = 'block';
    }

    clearClientAvailability() {
        document.querySelectorAll('.availability-grid input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    setClientAvailability(availability) {
        this.clearClientAvailability();
        Object.keys(availability).forEach(day => {
            availability[day].forEach(timeSlot => {
                const checkbox = document.querySelector(`input[data-day="${day}"][data-time="${timeSlot}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        });
    }

    getClientAvailability() {
        const availability = {};
        document.querySelectorAll('.availability-grid input[type="checkbox"]:checked').forEach(checkbox => {
            const day = checkbox.getAttribute('data-day');
            const timeSlot = checkbox.getAttribute('data-time');
            
            if (!availability[day]) {
                availability[day] = [];
            }
            availability[day].push(timeSlot);
        });
        return availability;
    }

    async handleClientFormSubmit(e) {
        e.preventDefault();
        
        const clientData = {
            id: this.currentEditingClient ? this.currentEditingClient.id : this.generateId(),
            name: this.clientName.value.trim(),
            email: this.clientEmail.value.trim(),
            phone: this.clientPhone.value.trim(),
            address: this.clientAddress.value.trim(),
            skillLevel: this.clientSkillLevel.value,
            availability: this.getClientAvailability(),
            notes: this.clientNotes.value.trim(),
            coordinates: null,
            created: this.currentEditingClient ? this.currentEditingClient.created : Date.now()
        };

        // Geocode address
        try {
            clientData.coordinates = await this.geocodeAddress(clientData.address);
        } catch (error) {
            console.warn('Geocoding failed:', error);
            // Continue without coordinates - proximity features will be limited
        }

        if (this.currentEditingClient) {
            this.updateClient(clientData);
        } else {
            this.addClient(clientData);
        }

        this.saveClients();
        this.renderClients();
        this.renderRecommendations();
        this.closeModal('client');
    }

    addClient(client) {
        this.clients.push(client);
        this.showNotification('Client added successfully!', 'success');
    }

    updateClient(updatedClient) {
        const index = this.clients.findIndex(client => client.id === updatedClient.id);
        if (index !== -1) {
            this.clients[index] = updatedClient;
            this.showNotification('Client updated successfully!', 'success');
        }
    }

    deleteClient() {
        if (this.currentEditingClient && confirm('Are you sure you want to delete this client?')) {
            this.clients = this.clients.filter(client => client.id !== this.currentEditingClient.id);
            this.saveClients();
            this.renderClients();
            this.renderRecommendations();
            this.closeModal('client');
            this.showNotification('Client deleted successfully!', 'success');
        }
    }

    renderClients() {
        this.clientsListElement.innerHTML = '';

        if (this.clients.length === 0) {
            this.clientsListElement.innerHTML = '<p style="text-align: center; color: #6c757d;">No clients added yet.</p>';
            return;
        }

        this.clients.forEach(client => {
            const clientElement = this.createClientElement(client);
            this.clientsListElement.appendChild(clientElement);
        });
    }

    createClientElement(client) {
        const clientElement = document.createElement('div');
        clientElement.className = 'client-item';

        const availabilityTags = this.getAvailabilityTags(client.availability);
        
        clientElement.innerHTML = `
            <div class="client-name">${client.name}</div>
            <div class="client-details">
                📧 ${client.email || 'No email'}<br>
                📱 ${client.phone || 'No phone'}<br>
                📍 ${client.address}<br>
                🏊‍♀️ ${this.capitalizeFirst(client.skillLevel)}
            </div>
            <div class="client-availability">
                ${availabilityTags}
            </div>
        `;

        clientElement.addEventListener('click', () => {
            this.openEditClientModal(client);
        });

        return clientElement;
    }

    getAvailabilityTags(availability) {
        const tags = [];
        Object.keys(availability).forEach(day => {
            availability[day].forEach(timeSlot => {
                tags.push(`<span class="availability-tag">${day.substr(0,3)} ${timeSlot}</span>`);
            });
        });
        return tags.join('');
    }

    // Lesson Management Methods (Updated)
    openAddLessonModal(date = null) {
        this.currentEditingLesson = null;
        this.lessonModalTitle.textContent = 'Add Swimming Lesson';
        this.deleteButton.style.display = 'none';
        
        this.lessonForm.reset();
        this.lessonDuration.value = 60;
        
        if (date) {
            this.lessonDate.value = date.toISOString().split('T')[0];
        }
        
        this.lessonModal.style.display = 'block';
    }

    openEditLessonModal(lesson) {
        this.currentEditingLesson = lesson;
        this.lessonModalTitle.textContent = 'Edit Swimming Lesson';
        this.deleteButton.style.display = 'inline-block';
        
        this.lessonTitle.value = lesson.title;
        this.lessonDate.value = lesson.date;
        this.lessonTime.value = lesson.time;
        this.lessonDuration.value = lesson.duration;
        this.lessonInstructor.value = lesson.instructor || '';
        this.lessonNotes.value = lesson.notes || '';
        this.enableNotification.checked = lesson.notification || false;
        
        this.lessonModal.style.display = 'block';
    }

    handleLessonFormSubmit(e) {
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
            created: this.currentEditingLesson ? this.currentEditingLesson.created : Date.now(),
            clients: this.currentEditingLesson ? this.currentEditingLesson.clients || [] : []
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
        this.closeModal('lesson');
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
            this.closeModal('lesson');
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
        const formattedDate = lessonDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const clientNames = lesson.clients ? lesson.clients.map(clientId => {
            const client = this.clients.find(c => c.id === clientId);
            return client ? client.name : 'Unknown Client';
        }).join(', ') : '';

        lessonElement.innerHTML = `
            <div class="lesson-title">${lesson.title}</div>
            <div class="lesson-details">
                📅 ${formattedDate} at ${this.formatTime(lesson.time)}<br>
                ⏱️ Duration: ${lesson.duration} minutes<br>
                ${lesson.instructor ? `👨‍🏫 Instructor: ${lesson.instructor}<br>` : ''}
                ${clientNames ? `👥 Clients: ${clientNames}<br>` : ''}
                ${lesson.notes ? `📝 ${lesson.notes}` : ''}
            </div>
        `;

        lessonElement.addEventListener('click', () => {
            this.openEditLessonModal(lesson);
        });

        return lessonElement;
    }

    // Geocoding and Location Methods
    async geocodeAddress(address) {
        // Check cache first
        if (this.geocodeCache[address]) {
            return this.geocodeCache[address];
        }

        try {
            // Using a free geocoding service (Nominatim)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const coordinates = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                
                // Cache the result
                this.geocodeCache[address] = coordinates;
                this.saveGeocodeCache();
                
                return coordinates;
            } else {
                throw new Error('Address not found');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    // Distance calculation using Haversine formula
    calculateDistance(coord1, coord2) {
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRadians(coord2.lat - coord1.lat);
        const dLng = this.toRadians(coord2.lng - coord1.lng);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Clustering Algorithm
    clusterClientsByProximity(clients, maxDistance = 10) {
        const clusters = [];
        const used = new Set();

        clients.forEach(client => {
            if (used.has(client.id) || !client.coordinates) return;

            const cluster = [client];
            used.add(client.id);

            clients.forEach(otherClient => {
                if (used.has(otherClient.id) || !otherClient.coordinates || client.id === otherClient.id) return;

                const distance = this.calculateDistance(client.coordinates, otherClient.coordinates);
                if (distance <= maxDistance) {
                    cluster.push(otherClient);
                    used.add(otherClient.id);
                }
            });

            clusters.push(cluster);
        });

        return clusters;
    }

    // Availability Overlap Detection
    findAvailabilityOverlap(clients) {
        if (clients.length === 0) return {};

        const commonAvailability = {};
        
        // Get days that all clients have availability
        const allDays = new Set();
        clients.forEach(client => {
            Object.keys(client.availability).forEach(day => {
                allDays.add(day);
            });
        });

        allDays.forEach(day => {
            const timeSlots = ['morning', 'afternoon', 'evening'];
            const availableSlots = [];

            timeSlots.forEach(slot => {
                const availableClients = clients.filter(client => 
                    client.availability[day] && client.availability[day].includes(slot)
                );

                if (availableClients.length >= 2) { // Need at least 2 clients for group lesson
                    availableSlots.push({
                        timeSlot: slot,
                        availableClients: availableClients,
                        count: availableClients.length
                    });
                }
            });

            if (availableSlots.length > 0) {
                commonAvailability[day] = availableSlots;
            }
        });

        return commonAvailability;
    }

    // Schedule Optimization Engine
    async runScheduleOptimization() {
        if (this.clients.length === 0) {
            this.showNotification('Please add clients first before optimizing schedule.', 'warning');
            return;
        }

        this.showNotification('Running schedule optimization...', 'info');

        try {
            // Step 1: Ensure all clients have coordinates
            const clientsWithCoordinates = [];
            for (const client of this.clients) {
                if (!client.coordinates && client.address) {
                    try {
                        client.coordinates = await this.geocodeAddress(client.address);
                        clientsWithCoordinates.push(client);
                    } catch (error) {
                        console.warn(`Failed to geocode ${client.name}: ${error.message}`);
                    }
                } else if (client.coordinates) {
                    clientsWithCoordinates.push(client);
                }
            }

            // Step 2: Cluster clients by proximity
            const clusters = this.clusterClientsByProximity(clientsWithCoordinates);

            // Step 3: Find availability overlaps for each cluster
            const recommendations = [];
            clusters.forEach((cluster, index) => {
                const overlap = this.findAvailabilityOverlap(cluster);
                
                Object.keys(overlap).forEach(day => {
                    overlap[day].forEach(slot => {
                        // Calculate efficiency score
                        const avgDistance = this.calculateAverageDistanceInCluster(cluster);
                        const clientCount = slot.availableClients.length;
                        const efficiencyScore = Math.round((clientCount / Math.max(avgDistance, 1)) * 100);

                        recommendations.push({
                            id: this.generateId(),
                            day: day,
                            timeSlot: slot.timeSlot,
                            clients: slot.availableClients,
                            clusterIndex: index,
                            avgDistance: avgDistance,
                            efficiencyScore: efficiencyScore,
                            suggestedDuration: this.calculateOptimalDuration(slot.availableClients)
                        });
                    });
                });
            });

            // Step 4: Sort recommendations by efficiency score
            recommendations.sort((a, b) => b.efficiencyScore - a.efficiencyScore);

            // Step 5: Display results
            this.displayOptimizationResults(recommendations);

        } catch (error) {
            console.error('Optimization error:', error);
            this.showNotification('Error during optimization. Please try again.', 'error');
        }
    }

    calculateAverageDistanceInCluster(cluster) {
        if (cluster.length < 2) return 0;

        let totalDistance = 0;
        let pairs = 0;

        for (let i = 0; i < cluster.length; i++) {
            for (let j = i + 1; j < cluster.length; j++) {
                if (cluster[i].coordinates && cluster[j].coordinates) {
                    totalDistance += this.calculateDistance(cluster[i].coordinates, cluster[j].coordinates);
                    pairs++;
                }
            }
        }

        return pairs > 0 ? totalDistance / pairs : 0;
    }

    calculateOptimalDuration(clients) {
        // Base duration on skill level mix
        const beginnerCount = clients.filter(c => c.skillLevel === 'beginner').length;
        const intermediateCount = clients.filter(c => c.skillLevel === 'intermediate').length;
        const advancedCount = clients.filter(c => c.skillLevel === 'advanced').length;
        
        if (beginnerCount === clients.length) return 45; // Shorter for all beginners
        if (advancedCount >= clients.length / 2) return 75; // Longer for advanced
        return 60; // Standard duration
    }

    displayOptimizationResults(recommendations) {
        this.optimizationResults.innerHTML = '';

        if (recommendations.length === 0) {
            this.optimizationResults.innerHTML = '<p style="text-align: center; color: #6c757d;">No optimization opportunities found. Try adding more clients or updating their availability.</p>';
        } else {
            recommendations.slice(0, 10).forEach(rec => { // Show top 10 recommendations
                const recElement = this.createRecommendationElement(rec);
                this.optimizationResults.appendChild(recElement);
            });
        }

        this.optimizationModal.style.display = 'block';
    }

    createRecommendationElement(recommendation) {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';

        const timeSlotDisplay = {
            'morning': '8:00 AM - 12:00 PM',
            'afternoon': '12:00 PM - 5:00 PM', 
            'evening': '5:00 PM - 9:00 PM'
        };

        const clientTags = recommendation.clients.map(client => 
            `<span class="client-tag">${client.name}</span>`
        ).join('');

        recElement.innerHTML = `
            <div class="recommendation-title">
                📅 ${this.capitalizeFirst(recommendation.day)} ${timeSlotDisplay[recommendation.timeSlot]}
                <span class="efficiency-score">Efficiency: ${recommendation.efficiencyScore}%</span>
            </div>
            <div class="recommendation-details">
                👥 ${recommendation.clients.length} clients available<br>
                🗺️ Average distance: ${recommendation.avgDistance.toFixed(1)} miles<br>
                ⏱️ Suggested duration: ${recommendation.suggestedDuration} minutes
            </div>
            <div class="recommendation-clients">
                ${clientTags}
            </div>
        `;

        return recElement;
    }

    applyOptimizationRecommendations() {
        // This would automatically create lessons based on recommendations
        // For now, we'll just close the modal and show a message
        this.closeModal('optimization');
        this.showNotification('Optimization recommendations noted! You can now manually create lessons based on these suggestions.', 'success');
    }

    renderRecommendations() {
        // Show a simple recommendation summary on dashboard
        this.recommendationsListElement.innerHTML = '';
        
        const clientsWithAvailability = this.clients.filter(client => 
            Object.keys(client.availability).length > 0
        );

        if (clientsWithAvailability.length < 2) {
            this.recommendationsListElement.innerHTML = '<p style="text-align: center; color: #6c757d;">Add more clients to see scheduling recommendations.</p>';
            return;
        }

        const summary = document.createElement('div');
        summary.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>📊 ${this.clients.length} total clients</p>
                <p>📍 ${this.clients.filter(c => c.coordinates).length} with location data</p>
                <p>📅 ${clientsWithAvailability.length} with availability set</p>
                <button class="btn-primary" onclick="document.getElementById('optimize-schedule-btn').click()" style="margin-top: 15px;">
                    Run Optimization
                </button>
            </div>
        `;
        this.recommendationsListElement.appendChild(summary);
    }

    // Modal Management
    closeModal(modalType) {
        const modals = {
            'lesson': this.lessonModal,
            'client': this.clientModal,
            'optimization': this.optimizationModal
        };

        if (modalType && modals[modalType]) {
            modals[modalType].style.display = 'none';
        }

        // Reset editing states
        if (modalType === 'lesson' || !modalType) {
            this.currentEditingLesson = null;
        }
        if (modalType === 'client' || !modalType) {
            this.currentEditingClient = null;
        }
    }

    closeAllModals() {
        this.lessonModal.style.display = 'none';
        this.clientModal.style.display = 'none';
        this.optimizationModal.style.display = 'none';
        this.currentEditingLesson = null;
        this.currentEditingClient = null;
    }

    // Utility Methods
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Data Persistence
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

    loadClients() {
        try {
            const savedClients = localStorage.getItem('swimming-clients');
            return savedClients ? JSON.parse(savedClients) : [];
        } catch (error) {
            console.error('Error loading clients:', error);
            return [];
        }
    }

    saveClients() {
        try {
            localStorage.setItem('swimming-clients', JSON.stringify(this.clients));
        } catch (error) {
            console.error('Error saving clients:', error);
        }
    }

    loadGeocodeCache() {
        try {
            const cache = localStorage.getItem('geocode-cache');
            return cache ? JSON.parse(cache) : {};
        } catch (error) {
            console.error('Error loading geocode cache:', error);
            return {};
        }
    }

    saveGeocodeCache() {
        try {
            localStorage.setItem('geocode-cache', JSON.stringify(this.geocodeCache));
        } catch (error) {
            console.error('Error saving geocode cache:', error);
        }
    }

    // Notification System (kept from original)
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
        this.scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
        this.scheduledNotifications.clear();

        if (Notification.permission !== 'granted') return;

        const now = new Date();
        
        this.lessons
            .filter(lesson => lesson.notification)
            .forEach(lesson => {
                const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
                const reminderTime = new Date(lessonDateTime.getTime() - 15 * 60 * 1000);

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
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: ${type === 'warning' ? '#333' : 'white'};
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
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

// Initialize the advanced app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedSwimmingScheduler();
});



