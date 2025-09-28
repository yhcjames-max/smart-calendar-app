/**
 * 🏊‍♀️ Client Management Modals
 * Modal components for adding/editing clients and managing availability
 */

class ClientModals {
    constructor(schedulerInstance) {
        this.scheduler = schedulerInstance;
        this.currentClient = null;
        this.currentAvailabilitySlot = null;
        this.createModals();
    }
    
    createModals() {
        this.createClientModal();
        this.createAvailabilityModal();
    }
    
    createClientModal() {
        const modalHTML = `
            <div id="clientModal" class="client-modal">
                <div class="client-modal-content">
                    <div class="client-modal-header">
                        <h3 id="clientModalTitle">
                            <i class="fas fa-user-plus"></i>
                            Add New Client
                        </h3>
                        <button class="close-modal" onclick="closeClientModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="clientForm" onsubmit="clientModals.submitClientForm(event)">
                        <div class="form-group">
                            <label for="clientName">
                                <i class="fas fa-user"></i> Full Name *
                            </label>
                            <input type="text" id="clientName" required placeholder="Enter client's full name">
                        </div>
                        
                        <div class="form-group">
                            <label for="clientEmail">
                                <i class="fas fa-envelope"></i> Email Address
                            </label>
                            <input type="email" id="clientEmail" placeholder="client@example.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="clientPhone">
                                <i class="fas fa-phone"></i> Phone Number
                            </label>
                            <input type="tel" id="clientPhone" placeholder="+1 (555) 123-4567">
                        </div>
                        
                        <div class="form-group">
                            <label for="clientAddress">
                                <i class="fas fa-map-marker-alt"></i> Address *
                            </label>
                            <textarea id="clientAddress" required placeholder="Enter full address for location optimization"></textarea>
                            <small style="color: #666; font-size: 12px;">
                                This address will be used for proximity calculations and travel optimization.
                            </small>
                        </div>
                        
                        <div class="form-group">
                            <label for="clientSkillLevel">
                                <i class="fas fa-medal"></i> Swimming Skill Level
                            </label>
                            <select id="clientSkillLevel">
                                <option value="">Select skill level</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="competitive">Competitive</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="clientAge">
                                <i class="fas fa-birthday-cake"></i> Age Group
                            </label>
                            <select id="clientAge">
                                <option value="">Select age group</option>
                                <option value="child">Child (5-12)</option>
                                <option value="teen">Teen (13-17)</option>
                                <option value="adult">Adult (18-59)</option>
                                <option value="senior">Senior (60+)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="clientNotes">
                                <i class="fas fa-sticky-note"></i> Notes
                            </label>
                            <textarea id="clientNotes" placeholder="Special requirements, preferences, medical considerations, etc."></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-cancel" onclick="closeClientModal()">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary" id="clientSubmitBtn">
                                <i class="fas fa-save"></i> Save Client
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    createAvailabilityModal() {
        const modalHTML = `
            <div id="availabilityModal" class="client-modal">
                <div class="client-modal-content">
                    <div class="client-modal-header">
                        <h3 id="availabilityModalTitle">
                            <i class="fas fa-clock"></i>
                            Add Availability Slot
                        </h3>
                        <button class="close-modal" onclick="closeAvailabilityModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="availabilityForm" onsubmit="clientModals.submitAvailabilityForm(event)">
                        <div class="form-group">
                            <label for="availabilityClient">
                                <i class="fas fa-user"></i> Client *
                            </label>
                            <select id="availabilityClient" required>
                                <option value="">Select a client</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <i class="fas fa-calendar-alt"></i> Availability Type *
                            </label>
                            <div style="display: flex; gap: 20px; margin-top: 8px;">
                                <label style="display: flex; align-items: center; gap: 5px; font-weight: normal;">
                                    <input type="radio" name="availabilityType" value="recurring" checked>
                                    Recurring (Weekly)
                                </label>
                                <label style="display: flex; align-items: center; gap: 5px; font-weight: normal;">
                                    <input type="radio" name="availabilityType" value="specific">
                                    Specific Date
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group" id="dayOfWeekGroup">
                            <label for="availabilityDayOfWeek">
                                <i class="fas fa-calendar-week"></i> Day of Week *
                            </label>
                            <select id="availabilityDayOfWeek" required>
                                <option value="">Select day</option>
                                <option value="0">Sunday</option>
                                <option value="1">Monday</option>
                                <option value="2">Tuesday</option>
                                <option value="3">Wednesday</option>
                                <option value="4">Thursday</option>
                                <option value="5">Friday</option>
                                <option value="6">Saturday</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="specificDateGroup" style="display: none;">
                            <label for="availabilityDate">
                                <i class="fas fa-calendar-day"></i> Specific Date *
                            </label>
                            <input type="date" id="availabilityDate" min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label for="availabilityStartTime">
                                <i class="fas fa-play"></i> Start Time *
                            </label>
                            <input type="time" id="availabilityStartTime" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="availabilityEndTime">
                                <i class="fas fa-stop"></i> End Time *
                            </label>
                            <input type="time" id="availabilityEndTime" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="availabilityPriority">
                                <i class="fas fa-flag"></i> Priority
                            </label>
                            <select id="availabilityPriority">
                                <option value="medium">Medium</option>
                                <option value="high">High - Preferred time</option>
                                <option value="low">Low - If needed</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="availabilityNotes">
                                <i class="fas fa-comment"></i> Notes
                            </label>
                            <textarea id="availabilityNotes" placeholder="Any special notes about this time slot"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-cancel" onclick="closeAvailabilityModal()">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary" id="availabilitySubmitBtn">
                                <i class="fas fa-save"></i> Save Availability
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners for availability type radio buttons
        document.querySelectorAll('input[name="availabilityType"]').forEach(radio => {
            radio.addEventListener('change', this.toggleAvailabilityType.bind(this));
        });
    }
    
    // ===== CLIENT MODAL METHODS =====
    
    openClientModal(clientId = null) {
        this.currentClient = clientId;
        const modal = document.getElementById('clientModal');
        const title = document.getElementById('clientModalTitle');
        const submitBtn = document.getElementById('clientSubmitBtn');
        
        if (clientId) {
            // Edit mode
            const client = this.scheduler.clients.find(c => c.id === clientId);
            if (client) {
                title.innerHTML = '<i class="fas fa-user-edit"></i> Edit Client';
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Client';
                this.populateClientForm(client);
            }
        } else {
            // Add mode
            title.innerHTML = '<i class="fas fa-user-plus"></i> Add New Client';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Client';
            this.resetClientForm();
        }
        
        modal.classList.add('active');
        document.getElementById('clientName').focus();
    }
    
    closeClientModal() {
        const modal = document.getElementById('clientModal');
        modal.classList.remove('active');
        this.currentClient = null;
        this.resetClientForm();
    }
    
    populateClientForm(client) {
        document.getElementById('clientName').value = client.name || '';
        document.getElementById('clientEmail').value = client.email || '';
        document.getElementById('clientPhone').value = client.phone || '';
        document.getElementById('clientAddress').value = client.address || '';
        document.getElementById('clientSkillLevel').value = client.preferences?.skillLevel || '';
        document.getElementById('clientAge').value = client.preferences?.ageGroup || '';
        document.getElementById('clientNotes').value = client.preferences?.notes || '';
    }
    
    resetClientForm() {
        document.getElementById('clientForm').reset();
    }
    
    submitClientForm(event) {
        event.preventDefault();
        
        const formData = {
            name: document.getElementById('clientName').value.trim(),
            email: document.getElementById('clientEmail').value.trim(),
            phone: document.getElementById('clientPhone').value.trim(),
            address: document.getElementById('clientAddress').value.trim(),
            preferences: {
                skillLevel: document.getElementById('clientSkillLevel').value,
                ageGroup: document.getElementById('clientAge').value,
                notes: document.getElementById('clientNotes').value.trim()
            }
        };
        
        if (!formData.name || !formData.address) {
            alert('Please fill in the required fields: Name and Address');
            return;
        }
        
        try {
            if (this.currentClient) {
                // Update existing client
                this.scheduler.updateClient(this.currentClient, formData);
                this.showMessage('Client updated successfully!', 'success');
            } else {
                // Add new client
                this.scheduler.addClient(formData);
                this.showMessage('Client added successfully!', 'success');
            }
            
            this.closeClientModal();
            this.scheduler.renderClientsList();
            this.scheduler.updateAvailabilityClientSelect();
            
        } catch (error) {
            console.error('Error saving client:', error);
            this.showMessage('Error saving client. Please try again.', 'error');
        }
    }
    
    // ===== AVAILABILITY MODAL METHODS =====
    
    openAvailabilityModal(clientId = null, slotId = null) {
        this.currentClient = clientId;
        this.currentAvailabilitySlot = slotId;
        
        const modal = document.getElementById('availabilityModal');
        const title = document.getElementById('availabilityModalTitle');
        const submitBtn = document.getElementById('availabilitySubmitBtn');
        
        // Populate client dropdown
        this.populateAvailabilityClientSelect();
        
        if (slotId && clientId) {
            // Edit mode
            const client = this.scheduler.clients.find(c => c.id === clientId);
            const slot = client?.availability?.find(s => s.id === slotId);
            if (slot) {
                title.innerHTML = '<i class="fas fa-clock"></i> Edit Availability Slot';
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Slot';
                this.populateAvailabilityForm(slot, clientId);
            }
        } else {
            // Add mode
            title.innerHTML = '<i class="fas fa-clock"></i> Add Availability Slot';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Slot';
            this.resetAvailabilityForm();
            if (clientId) {
                document.getElementById('availabilityClient').value = clientId;
            }
        }
        
        modal.classList.add('active');
    }
    
    closeAvailabilityModal() {
        const modal = document.getElementById('availabilityModal');
        modal.classList.remove('active');
        this.currentClient = null;
        this.currentAvailabilitySlot = null;
        this.resetAvailabilityForm();
    }
    
    populateAvailabilityClientSelect() {
        const select = document.getElementById('availabilityClient');
        select.innerHTML = '<option value="">Select a client</option>';
        
        this.scheduler.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            select.appendChild(option);
        });
    }
    
    populateAvailabilityForm(slot, clientId) {
        document.getElementById('availabilityClient').value = clientId;
        document.getElementById('availabilityStartTime').value = slot.startTime;
        document.getElementById('availabilityEndTime').value = slot.endTime;
        document.getElementById('availabilityPriority').value = slot.priority || 'medium';
        document.getElementById('availabilityNotes').value = slot.notes || '';
        
        if (slot.date) {
            document.querySelector('input[value="specific"]').checked = true;
            document.getElementById('availabilityDate').value = slot.date;
            this.toggleAvailabilityType();
        } else {
            document.querySelector('input[value="recurring"]').checked = true;
            document.getElementById('availabilityDayOfWeek').value = slot.dayOfWeek.toString();
            this.toggleAvailabilityType();
        }
    }
    
    resetAvailabilityForm() {
        document.getElementById('availabilityForm').reset();
        document.querySelector('input[value="recurring"]').checked = true;
        this.toggleAvailabilityType();
    }
    
    toggleAvailabilityType() {
        const isRecurring = document.querySelector('input[value="recurring"]').checked;
        const dayOfWeekGroup = document.getElementById('dayOfWeekGroup');
        const specificDateGroup = document.getElementById('specificDateGroup');
        const dayOfWeekSelect = document.getElementById('availabilityDayOfWeek');
        const specificDateInput = document.getElementById('availabilityDate');
        
        if (isRecurring) {
            dayOfWeekGroup.style.display = 'block';
            specificDateGroup.style.display = 'none';
            dayOfWeekSelect.required = true;
            specificDateInput.required = false;
        } else {
            dayOfWeekGroup.style.display = 'none';
            specificDateGroup.style.display = 'block';
            dayOfWeekSelect.required = false;
            specificDateInput.required = true;
        }
    }
    
    submitAvailabilityForm(event) {
        event.preventDefault();
        
        const clientId = document.getElementById('availabilityClient').value;
        const isRecurring = document.querySelector('input[value="recurring"]').checked;
        
        if (!clientId) {
            alert('Please select a client');
            return;
        }
        
        const startTime = document.getElementById('availabilityStartTime').value;
        const endTime = document.getElementById('availabilityEndTime').value;
        
        // Validate time range
        if (startTime >= endTime) {
            alert('Start time must be before end time');
            return;
        }
        
        const availabilityData = {
            startTime: startTime,
            endTime: endTime,
            priority: document.getElementById('availabilityPriority').value,
            notes: document.getElementById('availabilityNotes').value.trim(),
            recurring: isRecurring
        };
        
        if (isRecurring) {
            availabilityData.dayOfWeek = parseInt(document.getElementById('availabilityDayOfWeek').value);
        } else {
            availabilityData.date = document.getElementById('availabilityDate').value;
            availabilityData.dayOfWeek = new Date(availabilityData.date).getDay();
        }
        
        try {
            if (this.currentAvailabilitySlot) {
                // Update existing slot - need to implement this in scheduler
                this.updateAvailabilitySlot(clientId, this.currentAvailabilitySlot, availabilityData);
                this.showMessage('Availability slot updated successfully!', 'success');
            } else {
                // Add new slot
                this.scheduler.addClientAvailability(clientId, availabilityData);
                this.showMessage('Availability slot added successfully!', 'success');
            }
            
            this.closeAvailabilityModal();
            this.scheduler.renderClientAvailability();
            
        } catch (error) {
            console.error('Error saving availability:', error);
            this.showMessage('Error saving availability. Please try again.', 'error');
        }
    }
    
    updateAvailabilitySlot(clientId, slotId, updates) {
        const client = this.scheduler.clients.find(c => c.id === clientId);
        if (client && client.availability) {
            const slotIndex = client.availability.findIndex(s => s.id === slotId);
            if (slotIndex !== -1) {
                client.availability[slotIndex] = { ...client.availability[slotIndex], ...updates };
                this.scheduler.saveClients();
            }
        }
    }
    
    deleteAvailabilitySlot(clientId, slotId) {
        if (confirm('Are you sure you want to delete this availability slot?')) {
            const client = this.scheduler.clients.find(c => c.id === clientId);
            if (client && client.availability) {
                client.availability = client.availability.filter(s => s.id !== slotId);
                this.scheduler.saveClients();
                this.scheduler.renderClientAvailability();
                this.showMessage('Availability slot deleted successfully!', 'success');
            }
        }
    }
    
    // ===== UTILITY METHODS =====
    
    showMessage(message, type = 'success') {
        // Remove any existing messages
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        // Insert after the scheduler interface
        const scheduler = document.getElementById('clientSchedulerInterface');
        if (scheduler) {
            scheduler.insertAdjacentElement('afterend', messageDiv);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }
    
    // Public methods for scheduler to use
    editClient(clientId) {
        this.openClientModal(clientId);
    }
    
    addAvailabilityForClient(clientId) {
        this.openAvailabilityModal(clientId);
    }
    
    editAvailabilitySlot(clientId, slotId) {
        this.openAvailabilityModal(clientId, slotId);
    }
}

// Initialize modals when scheduler is ready
window.clientModals = null;
document.addEventListener('DOMContentLoaded', function() {
    // Function to check and initialize modals
    function initializeModals() {
        if (window.clientScheduler && !window.clientModals) {
            try {
                window.clientModals = new ClientModals(window.clientScheduler);
                console.log('✅ Client modals initialized successfully');
                return true;
            } catch (error) {
                console.error('❌ Failed to initialize client modals:', error);
                return false;
            }
        }
        return false;
    }
    
    // Try to initialize immediately
    setTimeout(() => {
        if (!initializeModals()) {
            // If not ready, keep trying every 500ms for up to 5 seconds
            let attempts = 0;
            const maxAttempts = 10;
            const retryInterval = setInterval(() => {
                attempts++;
                if (initializeModals() || attempts >= maxAttempts) {
                    clearInterval(retryInterval);
                    if (attempts >= maxAttempts && !window.clientModals) {
                        console.warn('⚠️ Client modals initialization timed out');
                    }
                }
            }, 500);
        }
    }, 800);
});
