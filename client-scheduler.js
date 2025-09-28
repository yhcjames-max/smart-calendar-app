/**
 * 🏊‍♀️ Advanced Client Scheduling Optimization System
 * Features: Availability collection, location clustering, distance optimization
 */

class ClientSchedulingSystem {
    constructor() {
        this.clients = JSON.parse(localStorage.getItem('swimmingClients')) || [];
        this.clusters = [];
        this.recommendations = [];
        this.geocodingCache = JSON.parse(localStorage.getItem('geocodingCache')) || {};
        
        // Configuration
        this.config = {
            maxClusterDistance: 5, // km
            minClientsPerCluster: 2,
            maxClientsPerCluster: 6,
            geocodingApiKey: null, // Will use free services if not provided
            timeSlotDuration: 60, // minutes
            travelBuffer: 30 // minutes buffer between sessions
        };
        
        this.init();
    }
    
    init() {
        this.loadConfiguration();
        this.renderClientInterface();
    }
    
    loadConfiguration() {
        const savedConfig = localStorage.getItem('schedulerConfig');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
    }
    
    saveConfiguration() {
        localStorage.setItem('schedulerConfig', JSON.stringify(this.config));
    }
    
    // ===== CLIENT MANAGEMENT =====
    
    addClient(clientData) {
        const client = {
            id: Date.now().toString(),
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            coordinates: null,
            availability: clientData.availability || [],
            preferences: clientData.preferences || {},
            createdAt: new Date().toISOString()
        };
        
        this.clients.push(client);
        this.saveClients();
        this.geocodeClientAddress(client);
        return client;
    }
    
    updateClient(clientId, updates) {
        const index = this.clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            this.clients[index] = { ...this.clients[index], ...updates };
            
            // Re-geocode if address changed
            if (updates.address && updates.address !== this.clients[index].address) {
                this.geocodeClientAddress(this.clients[index]);
            }
            
            this.saveClients();
            return this.clients[index];
        }
        return null;
    }
    
    deleteClient(clientId) {
        this.clients = this.clients.filter(c => c.id !== clientId);
        this.saveClients();
    }
    
    saveClients() {
        localStorage.setItem('swimmingClients', JSON.stringify(this.clients));
    }
    
    // ===== LOCATION & GEOCODING =====
    
    async geocodeClientAddress(client) {
        if (this.geocodingCache[client.address]) {
            client.coordinates = this.geocodingCache[client.address];
            this.saveClients();
            return;
        }
        
        try {
            const coordinates = await this.geocodeAddress(client.address);
            if (coordinates) {
                client.coordinates = coordinates;
                this.geocodingCache[client.address] = coordinates;
                localStorage.setItem('geocodingCache', JSON.stringify(this.geocodingCache));
                this.saveClients();
            }
        } catch (error) {
            console.error('Geocoding failed for client:', client.name, error);
        }
    }
    
    async geocodeAddress(address) {
        // Using Nominatim (free OpenStreetMap geocoding service)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        
        return null;
    }
    
    // ===== DISTANCE CALCULATIONS =====
    
    calculateDistance(coord1, coord2) {
        if (!coord1 || !coord2) return null;
        
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(coord2.lat - coord1.lat);
        const dLng = this.toRadians(coord2.lng - coord1.lng);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    }
    
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // ===== CLUSTERING ALGORITHMS =====
    
    createProximityClusters() {
        const clientsWithCoords = this.clients.filter(c => c.coordinates);
        const clusters = [];
        const used = new Set();
        
        for (let i = 0; i < clientsWithCoords.length; i++) {
            if (used.has(i)) continue;
            
            const cluster = [clientsWithCoords[i]];
            used.add(i);
            
            for (let j = i + 1; j < clientsWithCoords.length; j++) {
                if (used.has(j)) continue;
                
                const distance = this.calculateDistance(
                    clientsWithCoords[i].coordinates,
                    clientsWithCoords[j].coordinates
                );
                
                if (distance && distance <= this.config.maxClusterDistance) {
                    // Check if this client is close to any client in the cluster
                    const isCloseToCluster = cluster.some(clusterClient => {
                        const distanceToCluster = this.calculateDistance(
                            clientsWithCoords[j].coordinates,
                            clusterClient.coordinates
                        );
                        return distanceToCluster <= this.config.maxClusterDistance;
                    });
                    
                    if (isCloseToCluster && cluster.length < this.config.maxClientsPerCluster) {
                        cluster.push(clientsWithCoords[j]);
                        used.add(j);
                    }
                }
            }
            
            if (cluster.length >= this.config.minClientsPerCluster) {
                clusters.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    clients: cluster,
                    center: this.calculateClusterCenter(cluster),
                    averageDistance: this.calculateAverageDistanceInCluster(cluster)
                });
            }
        }
        
        this.clusters = clusters;
        return clusters;
    }
    
    calculateClusterCenter(clients) {
        const coords = clients.map(c => c.coordinates);
        const center = {
            lat: coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length,
            lng: coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length
        };
        return center;
    }
    
    calculateAverageDistanceInCluster(clients) {
        if (clients.length < 2) return 0;
        
        let totalDistance = 0;
        let pairCount = 0;
        
        for (let i = 0; i < clients.length; i++) {
            for (let j = i + 1; j < clients.length; j++) {
                const distance = this.calculateDistance(
                    clients[i].coordinates,
                    clients[j].coordinates
                );
                if (distance) {
                    totalDistance += distance;
                    pairCount++;
                }
            }
        }
        
        return pairCount > 0 ? Math.round((totalDistance / pairCount) * 100) / 100 : 0;
    }
    
    // ===== AVAILABILITY MANAGEMENT =====
    
    addClientAvailability(clientId, availabilitySlot) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            if (!client.availability) client.availability = [];
            
            const slot = {
                id: Date.now().toString(),
                dayOfWeek: availabilitySlot.dayOfWeek, // 0-6 (Sunday-Saturday)
                startTime: availabilitySlot.startTime, // HH:MM format
                endTime: availabilitySlot.endTime,     // HH:MM format
                date: availabilitySlot.date,           // Specific date (optional)
                recurring: availabilitySlot.recurring || true,
                priority: availabilitySlot.priority || 'medium' // high, medium, low
            };
            
            client.availability.push(slot);
            this.saveClients();
            return slot;
        }
        return null;
    }
    
    findOverlappingAvailability(clients, targetDate) {
        const overlaps = [];
        
        // Convert target date to day of week
        const dayOfWeek = new Date(targetDate).getDay();
        
        // Get all time slots for each client on this day
        const clientSlots = clients.map(client => ({
            client,
            slots: client.availability.filter(slot => {
                return slot.dayOfWeek === dayOfWeek || 
                       (slot.date && slot.date === targetDate);
            })
        })).filter(cs => cs.slots.length > 0);
        
        if (clientSlots.length < 2) return overlaps;
        
        // Find overlapping time windows
        const timeSlots = this.generateTimeSlots();
        
        for (const timeSlot of timeSlots) {
            const availableClients = clientSlots.filter(cs => 
                cs.slots.some(slot => this.isTimeInSlot(timeSlot, slot))
            );
            
            if (availableClients.length >= 2) {
                overlaps.push({
                    time: timeSlot,
                    availableClients: availableClients.map(cs => cs.client),
                    count: availableClients.length,
                    score: this.calculateAvailabilityScore(availableClients, timeSlot)
                });
            }
        }
        
        return overlaps.sort((a, b) => b.score - a.score);
    }
    
    generateTimeSlots() {
        const slots = [];
        for (let hour = 6; hour <= 22; hour++) {
            for (let minute = 0; minute < 60; minute += this.config.timeSlotDuration) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    }
    
    isTimeInSlot(time, availabilitySlot) {
        const [timeHour, timeMinute] = time.split(':').map(Number);
        const [startHour, startMinute] = availabilitySlot.startTime.split(':').map(Number);
        const [endHour, endMinute] = availabilitySlot.endTime.split(':').map(Number);
        
        const timeMinutes = timeHour * 60 + timeMinute;
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        return timeMinutes >= startMinutes && timeMinutes + this.config.timeSlotDuration <= endMinutes;
    }
    
    calculateAvailabilityScore(availableClients, timeSlot) {
        let score = availableClients.length * 10; // Base score for number of clients
        
        // Add priority bonuses
        availableClients.forEach(cs => {
            const relevantSlots = cs.slots.filter(slot => this.isTimeInSlot(timeSlot, slot));
            relevantSlots.forEach(slot => {
                switch (slot.priority) {
                    case 'high': score += 5; break;
                    case 'medium': score += 3; break;
                    case 'low': score += 1; break;
                }
            });
        });
        
        return score;
    }
    
    // ===== OPTIMIZATION ENGINE =====
    
    generateOptimizedSchedule(startDate, endDate, maxSessions = 10) {
        const clusters = this.createProximityClusters();
        const recommendations = [];
        
        const currentDate = new Date(startDate);
        const finalDate = new Date(endDate);
        
        while (currentDate <= finalDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            for (const cluster of clusters) {
                const overlaps = this.findOverlappingAvailability(cluster.clients, dateStr);
                
                for (const overlap of overlaps.slice(0, 3)) { // Top 3 time slots per cluster per day
                    recommendations.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        date: dateStr,
                        time: overlap.time,
                        cluster: cluster,
                        clients: overlap.availableClients,
                        score: overlap.score,
                        travelOptimization: this.calculateTravelOptimization(cluster),
                        estimatedDuration: this.config.timeSlotDuration,
                        created: new Date().toISOString()
                    });
                }
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Sort by score and limit results
        this.recommendations = recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, maxSessions);
        
        return this.recommendations;
    }
    
    calculateTravelOptimization(cluster) {
        const center = cluster.center;
        const distances = cluster.clients.map(client => 
            this.calculateDistance(center, client.coordinates)
        );
        
        return {
            centerCoordinate: center,
            maxDistanceFromCenter: Math.max(...distances),
            averageDistanceFromCenter: distances.reduce((a, b) => a + b, 0) / distances.length,
            totalClients: cluster.clients.length,
            estimatedTravelTime: Math.max(...distances) * 2 // Rough estimate: 2 minutes per km
        };
    }
    
    // ===== UI RENDERING =====
    
    renderClientInterface() {
        const existingInterface = document.getElementById('clientSchedulerInterface');
        if (existingInterface) existingInterface.remove();
        
        const interfaceHTML = `
            <div id="clientSchedulerInterface" class="scheduler-interface">
                <div class="scheduler-tabs">
                    <button class="tab-btn active" onclick="showTab('clients')">
                        <i class="fas fa-users"></i> Clients
                    </button>
                    <button class="tab-btn" onclick="showTab('availability')">
                        <i class="fas fa-clock"></i> Availability
                    </button>
                    <button class="tab-btn" onclick="showTab('clusters')">
                        <i class="fas fa-map-marker-alt"></i> Clusters
                    </button>
                    <button class="tab-btn" onclick="showTab('recommendations')">
                        <i class="fas fa-magic"></i> Recommendations
                    </button>
                </div>
                
                <div id="clientsTab" class="tab-content active">
                    <div class="tab-header">
                        <h3><i class="fas fa-users"></i> Client Management</h3>
                        <button class="btn-primary" onclick="window.openClientModal()">
                            <i class="fas fa-plus"></i> Add Client
                        </button>
                    </div>
                    <div id="clientsList" class="clients-list"></div>
                </div>
                
                <div id="availabilityTab" class="tab-content">
                    <div class="tab-header">
                        <h3><i class="fas fa-clock"></i> Availability Management</h3>
                        <select id="availabilityClientSelect" onchange="clientScheduler.renderClientAvailability()">
                            <option value="">Select a client...</option>
                        </select>
                    </div>
                    <div id="availabilityContent"></div>
                </div>
                
                <div id="clustersTab" class="tab-content">
                    <div class="tab-header">
                        <h3><i class="fas fa-map-marker-alt"></i> Proximity Clusters</h3>
                        <button class="btn-secondary" onclick="generateClusters()">
                            <i class="fas fa-refresh"></i> Generate Clusters
                        </button>
                    </div>
                    <div id="clustersContent"></div>
                </div>
                
                <div id="recommendationsTab" class="tab-content">
                    <div class="tab-header">
                        <h3><i class="fas fa-magic"></i> Optimized Recommendations</h3>
                        <div class="recommendation-controls">
                            <input type="date" id="scheduleStartDate" value="${new Date().toISOString().split('T')[0]}">
                            <input type="date" id="scheduleEndDate" value="${new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}">
                            <button class="btn-primary" onclick="generateRecommendations()">
                                <i class="fas fa-magic"></i> Generate
                            </button>
                        </div>
                    </div>
                    <div id="recommendationsContent"></div>
                </div>
            </div>
        `;
        
        // Insert after the calendar container
        const calendar = document.querySelector('.container');
        calendar.insertAdjacentHTML('afterend', interfaceHTML);
        
        this.renderClientsList();
        this.updateAvailabilityClientSelect();
    }
    
    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab
        document.getElementById(tabName + 'Tab').classList.add('active');
        event.target.classList.add('active');
        
        // Refresh content based on tab
        switch(tabName) {
            case 'clients':
                this.renderClientsList();
                break;
            case 'availability':
                this.updateAvailabilityClientSelect();
                break;
            case 'clusters':
                this.renderClusters();
                break;
            case 'recommendations':
                this.renderRecommendations();
                break;
        }
    }
    
    renderClientsList() {
        const container = document.getElementById('clientsList');
        if (!container) return;
        
        if (this.clients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users fa-3x"></i>
                    <h4>No clients yet</h4>
                    <p>Add your first client to start scheduling optimization</p>
                </div>
            `;
            return;
        }
        
        const clientsHTML = this.clients.map(client => `
            <div class="client-card" data-client-id="${client.id}">
                <div class="client-info">
                    <div class="client-header">
                        <h4><i class="fas fa-user"></i> ${client.name}</h4>
                        <div class="client-actions">
                            <button onclick="editClient('${client.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteClient('${client.id}')" title="Delete" class="danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="client-details">
                        <p><i class="fas fa-envelope"></i> ${client.email || 'No email'}</p>
                        <p><i class="fas fa-phone"></i> ${client.phone || 'No phone'}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${client.address || 'No address'}</p>
                        <div class="client-stats">
                            <span class="stat">
                                <i class="fas fa-clock"></i> 
                                ${client.availability ? client.availability.length : 0} time slots
                            </span>
                            <span class="stat ${client.coordinates ? 'success' : 'warning'}">
                                <i class="fas fa-map-pin"></i> 
                                ${client.coordinates ? 'Located' : 'Pending location'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = clientsHTML;
    }
    
    // ===== MODAL INTEGRATION =====
    
    openClientModal(clientId = null) {
        console.log('🔧 Opening client modal for:', clientId || 'new client');
        
        if (window.clientModals) {
            window.clientModals.openClientModal(clientId);
        } else {
            console.warn('⚠️ Client modals not ready, initializing...');
            // Try to initialize modals if not ready
            this.initializeModalsIfNeeded();
            
            // Retry after a short delay
            setTimeout(() => {
                if (window.clientModals) {
                    window.clientModals.openClientModal(clientId);
                } else {
                    alert('Client management system is still loading. Please wait a moment and try again.');
                }
            }, 500);
        }
    }
    
    initializeModalsIfNeeded() {
        if (!window.clientModals && typeof ClientModals !== 'undefined') {
            try {
                window.clientModals = new ClientModals(this);
                console.log('✅ Client modals initialized successfully');
            } catch (error) {
                console.error('❌ Failed to initialize client modals:', error);
            }
        }
    }
    
    editClient(clientId) {
        this.openClientModal(clientId);
    }
    
    deleteClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client && confirm(`Are you sure you want to delete ${client.name}? This will also remove all their availability slots.`)) {
            this.clients = this.clients.filter(c => c.id !== clientId);
            this.saveClients();
            this.renderClientsList();
            this.updateAvailabilityClientSelect();
            
            if (window.clientModals) {
                window.clientModals.showMessage('Client deleted successfully!', 'success');
            }
        }
    }
    
    generateClusters() {
        this.createProximityClusters();
        this.renderClusters();
    }
    
    renderClusters() {
        const container = document.getElementById('clustersContent');
        if (!container) return;
        
        if (this.clusters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt fa-3x"></i>
                    <h4>No clusters generated</h4>
                    <p>Click "Generate Clusters" to group clients by proximity</p>
                </div>
            `;
            return;
        }
        
        const clustersHTML = this.clusters.map((cluster, index) => `
            <div class="cluster-card">
                <div class="cluster-header">
                    <h4><i class="fas fa-users"></i> Cluster ${index + 1}</h4>
                    <span class="cluster-stats">
                        ${cluster.clients.length} clients • 
                        ${cluster.averageDistance}km avg distance
                    </span>
                </div>
                <div class="cluster-clients">
                    ${cluster.clients.map(client => `
                        <div class="cluster-client">
                            <i class="fas fa-user-circle"></i>
                            <span>${client.name}</span>
                            <small>${client.address}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = clustersHTML;
    }
    
    generateRecommendations() {
        const startDate = document.getElementById('scheduleStartDate').value;
        const endDate = document.getElementById('scheduleEndDate').value;
        
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        
        this.generateOptimizedSchedule(startDate, endDate);
        this.renderRecommendations();
    }
    
    renderRecommendations() {
        const container = document.getElementById('recommendationsContent');
        if (!container) return;
        
        if (this.recommendations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-magic fa-3x"></i>
                    <h4>No recommendations yet</h4>
                    <p>Generate recommendations to see optimized scheduling suggestions</p>
                </div>
            `;
            return;
        }
        
        const recommendationsHTML = this.recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="rec-header">
                    <div class="rec-datetime">
                        <h4><i class="fas fa-calendar"></i> ${rec.date}</h4>
                        <span class="time"><i class="fas fa-clock"></i> ${rec.time}</span>
                    </div>
                    <div class="rec-score">
                        Score: <strong>${rec.score}</strong>
                    </div>
                </div>
                <div class="rec-clients">
                    <h5><i class="fas fa-users"></i> Clients (${rec.clients.length})</h5>
                    <div class="client-tags">
                        ${rec.clients.map(client => `
                            <span class="client-tag">${client.name}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="rec-travel">
                    <div class="travel-info">
                        <span><i class="fas fa-route"></i> Max travel: ${rec.travelOptimization.maxDistanceFromCenter.toFixed(1)}km</span>
                        <span><i class="fas fa-clock"></i> Est. travel time: ${rec.travelOptimization.estimatedTravelTime.toFixed(0)} min</span>
                    </div>
                </div>
                <div class="rec-actions">
                    <button class="btn-primary" onclick="scheduleRecommendation('${rec.id}')">
                        <i class="fas fa-calendar-plus"></i> Schedule This
                    </button>
                    <button class="btn-secondary" onclick="viewRecommendationDetails('${rec.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = recommendationsHTML;
    }
    
    scheduleRecommendation(recommendationId) {
        const recommendation = this.recommendations.find(r => r.id === recommendationId);
        if (recommendation) {
            // Integration with existing calendar
            if (window.calendar && window.calendar.openModal) {
                window.calendar.selectedDate = recommendation.date;
                window.calendar.openModal();
                
                // Pre-fill the form
                setTimeout(() => {
                    document.getElementById('lessonTitle').value = `Group Session - ${recommendation.clients.length} clients`;
                    document.getElementById('lessonDate').value = recommendation.date;
                    document.getElementById('lessonTime').value = recommendation.time;
                    document.getElementById('lessonDuration').value = recommendation.estimatedDuration;
                    document.getElementById('lessonNotes').value = `Optimized group session for:\n${recommendation.clients.map(c => c.name).join('\n')}`;
                }, 100);
            }
        }
    }
    
    updateAvailabilityClientSelect() {
        const select = document.getElementById('availabilityClientSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select a client...</option>';
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            select.appendChild(option);
        });
    }
    
    renderClientAvailability() {
        const clientId = document.getElementById('availabilityClientSelect').value;
        const container = document.getElementById('availabilityContent');
        
        if (!clientId) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock fa-2x"></i>
                    <h4>Select a client</h4>
                    <p>Choose a client from the dropdown to view and manage their availability</p>
                </div>
            `;
            return;
        }
        
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;
        
        const availabilitySlots = client.availability || [];
        
        let availabilityHTML = `
            <div class="availability-header">
                <h4><i class="fas fa-user-circle"></i> ${client.name}'s Availability</h4>
                <button class="btn-primary" onclick="addAvailabilityForClient('${clientId}')">
                    <i class="fas fa-plus"></i> Add Time Slot
                </button>
            </div>
        `;
        
        if (availabilitySlots.length === 0) {
            availabilityHTML += `
                <div class="empty-state">
                    <i class="fas fa-calendar-times fa-2x"></i>
                    <h4>No availability slots</h4>
                    <p>Add time slots when ${client.name} is available for swimming lessons</p>
                    <button class="btn-primary" onclick="addAvailabilityForClient('${clientId}')">
                        <i class="fas fa-plus"></i> Add First Slot
                    </button>
                </div>
            `;
        } else {
            // Group by day of week for recurring slots
            const recurringSlots = availabilitySlots.filter(slot => slot.recurring !== false);
            const specificSlots = availabilitySlots.filter(slot => slot.recurring === false);
            
            if (recurringSlots.length > 0) {
                availabilityHTML += `<h5><i class="fas fa-sync"></i> Weekly Recurring Slots</h5>`;
                
                // Group by day
                const slotsByDay = recurringSlots.reduce((acc, slot) => {
                    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek];
                    if (!acc[dayName]) acc[dayName] = [];
                    acc[dayName].push(slot);
                    return acc;
                }, {});
                
                Object.entries(slotsByDay).forEach(([dayName, daySlots]) => {
                    availabilityHTML += `
                        <div class="availability-day-group">
                            <h6><i class="fas fa-calendar-week"></i> ${dayName}</h6>
                            ${daySlots.map(slot => this.renderAvailabilitySlot(slot, clientId, dayName)).join('')}
                        </div>
                    `;
                });
            }
            
            if (specificSlots.length > 0) {
                availabilityHTML += `<h5><i class="fas fa-calendar-day"></i> Specific Date Slots</h5>`;
                specificSlots.forEach(slot => {
                    const date = new Date(slot.date).toLocaleDateString();
                    availabilityHTML += this.renderAvailabilitySlot(slot, clientId, date);
                });
            }
        }
        
        container.innerHTML = availabilityHTML;
    }
    
    renderAvailabilitySlot(slot, clientId, dayOrDate) {
        const priorityClass = `priority-${slot.priority || 'medium'}`;
        const priorityLabel = {
            high: 'High Priority',
            medium: 'Medium Priority',
            low: 'Low Priority'
        }[slot.priority || 'medium'];
        
        return `
            <div class="availability-slot">
                <div class="priority-indicator ${priorityClass}" title="${priorityLabel}"></div>
                <div class="availability-slot-header">
                    <div class="availability-slot-time">
                        <i class="fas fa-clock"></i>
                        ${slot.startTime} - ${slot.endTime}
                        ${slot.notes ? `<span class="slot-notes">• ${slot.notes}</span>` : ''}
                    </div>
                    <div class="availability-slot-actions">
                        <button onclick="editAvailabilitySlot('${clientId}', '${slot.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteAvailabilitySlot('${clientId}', '${slot.id}')" title="Delete" class="danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="availability-slot-details">
                    <span class="priority-badge ${priorityClass}">${priorityLabel}</span>
                    ${slot.recurring === false ? 
                        `<span class="date-badge">${dayOrDate}</span>` : 
                        `<span class="recurring-badge">Every ${dayOrDate}</span>`
                    }
                </div>
            </div>
        `;
    }
    
    // Add method to support recommendation scheduling
    viewRecommendationDetails(recommendationId) {
        const recommendation = this.recommendations.find(r => r.id === recommendationId);
        if (!recommendation) return;
        
        const detailsHTML = `
            <div class="recommendation-details">
                <h4>Recommendation Details</h4>
                <p><strong>Date:</strong> ${recommendation.date}</p>
                <p><strong>Time:</strong> ${recommendation.time}</p>
                <p><strong>Duration:</strong> ${recommendation.estimatedDuration} minutes</p>
                <p><strong>Clients (${recommendation.clients.length}):</strong></p>
                <ul>
                    ${recommendation.clients.map(client => `
                        <li>${client.name} - ${client.address}</li>
                    `).join('')}
                </ul>
                <p><strong>Travel Optimization:</strong></p>
                <ul>
                    <li>Max distance from center: ${recommendation.travelOptimization.maxDistanceFromCenter.toFixed(1)}km</li>
                    <li>Average distance: ${recommendation.travelOptimization.averageDistanceFromCenter.toFixed(1)}km</li>
                    <li>Estimated travel time: ${recommendation.travelOptimization.estimatedTravelTime.toFixed(0)} minutes</li>
                </ul>
                <p><strong>Optimization Score:</strong> ${recommendation.score}</p>
            </div>
        `;
        
        // Create a simple modal for details
        const modal = document.createElement('div');
        modal.className = 'client-modal active';
        modal.innerHTML = `
            <div class="client-modal-content">
                <div class="client-modal-header">
                    <h3><i class="fas fa-info-circle"></i> Recommendation Details</h3>
                    <button class="close-modal" onclick="this.closest('.client-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ${detailsHTML}
                <div class="form-actions">
                    <button class="btn-primary" onclick="scheduleRecommendation('${recommendationId}'); this.closest('.client-modal').remove();">
                        <i class="fas fa-calendar-plus"></i> Schedule This Session
                    </button>
                    <button class="btn-cancel" onclick="this.closest('.client-modal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// Initialize the system
window.clientScheduler = null;
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure the main calendar is loaded
    setTimeout(() => {
        window.clientScheduler = new ClientSchedulingSystem();
        console.log('✅ Client Scheduler initialized successfully');
    }, 500);
});
