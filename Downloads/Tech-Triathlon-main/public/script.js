// Global variables
let currentUser = null;
let currentLanguage = 'english';
let socket = null;

// DOM elements
const elements = {
    // Sections
    welcomeSection: document.getElementById('welcomeSection'),
    chatSection: document.getElementById('chatSection'),
    servicesSection: document.getElementById('servicesSection'),
    applicationSection: document.getElementById('applicationSection'),
    authSection: document.getElementById('authSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    
    // Buttons
    startChatBtn: document.getElementById('startChatBtn'),
    exploreServicesBtn: document.getElementById('exploreServicesBtn'),
    closeChatBtn: document.getElementById('closeChatBtn'),
    closeServicesBtn: document.getElementById('closeServicesBtn'),
    closeApplicationBtn: document.getElementById('closeApplicationBtn'),
     cancelApplicationBtn: document.getElementById('cancelApplicationBtn'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    newApplicationBtn: document.getElementById('newApplicationBtn'),
    submitComplaintBtn: document.getElementById('submitComplaintBtn'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    applicationForm: document.getElementById('applicationForm'),
    
    // Inputs
    chatInput: document.getElementById('chatInput'),
    languageSelect: document.getElementById('languageSelect'),
    
    // Other elements
    chatMessages: document.getElementById('chatMessages'),
    servicesList: document.getElementById('servicesList'),
    servicesGrid: document.getElementById('servicesGrid'),
    selectedCategoryTitle: document.getElementById('selectedCategoryTitle'),
    userSection: document.getElementById('userSection'),
    userName: document.getElementById('userName'),
    applicationsList: document.getElementById('applicationsList'),
    
    // Auth tabs
    authTabs: document.querySelectorAll('.auth-tab')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Initialize the application
function initializeApp() {
    // Initialize Socket.IO
    socket = io();
    
    // Register socket event handlers
    setupSocketHandlers();

    // If user already logged in (restored), join their personal room
    try {
        const storedUser = localStorage.getItem('govbot_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed && parsed.id) {
                socket.emit('join_user', { user_id: parsed.id });
            }
        }
    } catch (e) {
        console.warn('Failed to auto-join user room:', e);
    }

    // Set up language selector
    elements.languageSelect.value = currentLanguage;
    
    // Set initial language
    updateLanguage(currentLanguage);
}

// Setup socket event handlers
function setupSocketHandlers() {
    if (!socket) return;
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('chat_message', (data) => {
        console.log('Received message:', data);
    });
    
    socket.on('application_created', () => {
        loadUserApplications();
        loadDashboardSummary();
    });
    
    socket.on('complaint_created', () => {
        updateComplaintsStat();
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// Set up event listeners
function setupEventListeners() {
    // Language selector
    elements.languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        updateLanguage(currentLanguage);
    });
    
    // Welcome section buttons
    elements.startChatBtn.addEventListener('click', showChatSection);
    elements.exploreServicesBtn.addEventListener('click', showServicesSection);
    
    // Close buttons
    elements.closeChatBtn.addEventListener('click', hideChatSection);
    elements.closeServicesBtn.addEventListener('click', hideServicesSection);
    elements.closeApplicationBtn.addEventListener('click', hideApplicationSection);
    
    // Chat functionality
    elements.sendMessageBtn.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Authentication
    console.log('Setting up auth event listeners');
    console.log('Login form element:', elements.loginForm);
    console.log('Register form element:', elements.registerForm);
    
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Auth tabs
    elements.authTabs.forEach(tab => {
        console.log('Setting up tab listener for:', tab.dataset.tab);
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });
    
    // Application form
    elements.applicationForm.addEventListener('submit', handleApplicationSubmit);
    elements.cancelApplicationBtn.addEventListener('click', hideApplicationSection);
    
    // Dashboard buttons
    elements.newApplicationBtn.addEventListener('click', () => navigateToPage('services'));
    elements.submitComplaintBtn.addEventListener('click', showComplaintForm);
    
    // Service categories - using event delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.service-category')) {
            const category = e.target.closest('.service-category');
            showServicesList(category.dataset.category);
        }
    });
    
    // Navigation menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Additional application buttons
    const newApplicationFromList = document.getElementById('newApplicationFromList');
    if (newApplicationFromList) {
        newApplicationFromList.addEventListener('click', () => navigateToPage('services'));
    }
    
    // Complaint form close button
    const closeComplaintFormBtn = document.getElementById('closeComplaintFormBtn');
    if (closeComplaintFormBtn) {
        closeComplaintFormBtn.addEventListener('click', hideComplaintForm);
    }
    
    // Complaint form cancel button
    const cancelComplaintBtn = document.getElementById('cancelComplaintBtn');
    if (cancelComplaintBtn) {
        cancelComplaintBtn.addEventListener('click', hideComplaintForm);
    }
    
    // Complaint form submit
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintSubmit);
    }
}

// Language management
function updateLanguage(language) {
    currentLanguage = language;
    
    // Update all elements with language data attributes
    document.querySelectorAll('[data-english]').forEach(element => {
        const text = element.getAttribute(`data-${language}`) || element.getAttribute('data-english');
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = text;
        } else {
            element.textContent = text;
        }
    });
    
    // Update language selector
    elements.languageSelect.value = language;
}

// Section management
function showSection(sectionId) {
    console.log('showSection called with:', sectionId);
    
    // Hide all sections
    const sections = [
        'welcomeSection',
        'chatSection', 
        'servicesSection',
        'applicationSection',
        'authSection',
        'dashboardSection',
        'applicationsSection',
        'complaintsSection',
        'profileSection',
        'complaintFormSection'
    ];
    
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        console.log('Showing section:', sectionId);
        section.style.display = 'block';
    } else {
        console.error('Section not found:', sectionId);
    }
}

function showChatSection() {
    elements.welcomeSection.style.display = 'none';
    elements.chatSection.style.display = 'block';
    elements.chatInput.focus();
}

function hideChatSection() {
    elements.chatSection.style.display = 'none';
    elements.welcomeSection.style.display = 'block';
    elements.chatInput.value = '';
}

function showServicesSection() {
    // Use the unified section switcher to ensure other sections (e.g., dashboard) are hidden
    showSection('servicesSection');
    elements.servicesList.style.display = 'none';
}

function hideServicesSection() {
    elements.servicesSection.style.display = 'none';
    if (currentUser) {
        elements.dashboardSection.style.display = 'block';
    } else {
        elements.welcomeSection.style.display = 'block';
    }
}

function showApplicationSection(serviceName, serviceId) {
    console.log('showApplicationSection called with:', serviceName, serviceId);
    
    // Set the service ID in the hidden input
    document.getElementById('serviceId').value = serviceId;
    document.getElementById('serviceName').value = serviceName;
    
    // Fetch service details to get form fields
    fetch(`/api/services/id/${serviceId}`)
        .then(response => response.json())
        .then(service => {
            console.log('Service details fetched:', service);
            displayServiceInfo(service);
            generateDynamicForm(service.form_fields);
            showSection('applicationSection');
        })
        .catch(error => {
            console.error('Error fetching service details:', error);
            // Fallback to basic form
            showSection('applicationSection');
        });
}

function displayServiceInfo(service) {
    const serviceInfo = document.getElementById('serviceInfo');
    
    serviceInfo.innerHTML = `
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <div class="service-details">
            <div class="detail-item">
                <strong>Department:</strong>
                <span>${service.department}</span>
            </div>
            <div class="detail-item">
                <strong>Category:</strong>
                <span>${service.category}</span>
            </div>
            <div class="detail-item">
                <strong>Processing Time:</strong>
                <span>${service.processing_time}</span>
            </div>
            <div class="detail-item">
                <strong>Fees:</strong>
                <span>Rs. ${service.fees.toFixed(2)}</span>
            </div>
            <div class="detail-item">
                <strong>Requirements:</strong>
                <span>${service.requirements}</span>
            </div>
            ${service.department_contact ? `
            <div class="detail-item">
                <strong>Contact:</strong>
                <span>${service.department_contact}</span>
            </div>
            ` : ''}
            ${service.department_email ? `
            <div class="detail-item">
                <strong>Email:</strong>
                <span>${service.department_email}</span>
            </div>
            ` : ''}
        </div>
    `;
}

function generateDynamicForm(formFields) {
    const formSections = document.getElementById('formSections');
    formSections.innerHTML = '';
    
    if (!formFields || Object.keys(formFields).length === 0) {
        // Fallback to basic form
        formSections.innerHTML = `
            <div class="form-section">
                <h4>Personal Information</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="fullName">Full Name *</label>
                        <input type="text" id="fullName" name="fullName" required>
                    </div>
                    <div class="form-group">
                        <label for="nicNumber">NIC Number *</label>
                        <input type="text" id="nicNumber" name="nicNumber" required>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // Generate form sections based on form fields
    Object.entries(formFields).forEach(([sectionName, fields]) => {
        const section = document.createElement('div');
        section.className = 'form-section';
        
        // Convert section name to readable title
        const sectionTitle = sectionName.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        section.innerHTML = `<h4>${sectionTitle}</h4>`;
        
        // Generate form rows with fields
        const formRow = document.createElement('div');
        formRow.className = 'form-row';
        
        fields.forEach((field, index) => {
            const fieldName = field;
            const fieldLabel = field.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';
            
            // Determine input type based on field name
            let inputType = 'text';
            let inputAttributes = '';
            
            if (fieldName.includes('date')) {
                inputType = 'date';
            } else if (fieldName.includes('phone') || fieldName.includes('contact')) {
                inputType = 'tel';
            } else if (fieldName.includes('email')) {
                inputType = 'email';
            } else if (fieldName.includes('description') || fieldName.includes('details') || fieldName.includes('notes')) {
                inputType = 'textarea';
            } else if (fieldName.includes('gender')) {
                inputType = 'select';
                inputAttributes = `
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                `;
            } else if (fieldName.includes('marital_status')) {
                inputType = 'select';
                inputAttributes = `
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                `;
            }
            
            if (inputType === 'select') {
                fieldGroup.innerHTML = `
                    <label for="${fieldName}">${fieldLabel} *</label>
                    <select id="${fieldName}" name="${fieldName}" required>
                        ${inputAttributes}
                    </select>
                `;
            } else if (inputType === 'textarea') {
                fieldGroup.innerHTML = `
                    <label for="${fieldName}">${fieldLabel} *</label>
                    <textarea id="${fieldName}" name="${fieldName}" required></textarea>
                `;
            } else {
                fieldGroup.innerHTML = `
                    <label for="${fieldName}">${fieldLabel} *</label>
                    <input type="${inputType}" id="${fieldName}" name="${fieldName}" required>
                `;
            }
            
            formRow.appendChild(fieldGroup);
            
            // Create new row after every 2 fields for better layout
            if ((index + 1) % 2 === 0 && index < fields.length - 1) {
                section.appendChild(formRow.cloneNode(true));
                formRow.innerHTML = '';
            }
        });
        
        // Add remaining fields
        if (formRow.children.length > 0) {
            section.appendChild(formRow);
        }
        
        formSections.appendChild(section);
    });
}

function hideApplicationSection() {
    showSection('dashboardSection');
    
    // Clear dynamic form sections
    document.getElementById('formSections').innerHTML = '';
    document.getElementById('serviceInfo').innerHTML = '';
    
    // Reset form
    document.getElementById('applicationForm').reset();
}

// Chat functionality
function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    elements.chatInput.value = '';
    
    // Send message to server
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            language: currentLanguage,
            user_id: currentUser ? currentUser.id : null
        })
    })
    .then(response => response.json())
    .then(data => {
        // Add bot response to chat
        addMessageToChat(data.response, 'bot');
    })
    .catch(error => {
        console.error('Error sending message:', error);
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    });
}

function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const icon = document.createElement('i');
    icon.className = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = message;
    
    messageContent.appendChild(icon);
    messageContent.appendChild(messageText);
    messageDiv.appendChild(messageContent);
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Services functionality
function showServicesList(category) {
    console.log('showServicesList called with category:', category);
    
    elements.servicesList.style.display = 'block';
    elements.selectedCategoryTitle.textContent = category;
    
    // Fetch services for the selected category
    fetch(`/api/services/${encodeURIComponent(category)}`)
        .then(response => response.json())
        .then(services => {
            console.log('Services fetched for category:', category, services);
            displayServices(services);
        })
        .catch(error => {
            console.error('Error fetching services:', error);
            showNotification('Error loading services', 'error');
        });
}

function displayServices(services) {
    elements.servicesGrid.innerHTML = '';
    
    if (services.length === 0) {
        elements.servicesGrid.innerHTML = '<p>No services found for this category.</p>';
        return;
    }
    
    services.forEach(service => {
        const serviceDiv = document.createElement('div');
        serviceDiv.className = 'service-item';
        
        serviceDiv.innerHTML = `
            <div class="service-header">
                <h3>${service.name}</h3>
                <span class="service-category">${service.category}</span>
            </div>
            <p class="service-description">${service.description}</p>
            <div class="service-details">
                <div class="detail-item">
                    <strong>Requirements:</strong> ${service.requirements}
                </div>
                <div class="detail-item">
                    <strong>Fees:</strong> Rs. ${service.fees}
                </div>
                <div class="detail-item">
                    <strong>Processing Time:</strong> ${service.processing_time}
                </div>
                <div class="detail-item">
                    <strong>Department:</strong> ${service.department}
                </div>
            </div>
            <button class="btn btn-primary apply-btn" data-service-name="${service.name}" data-service-id="${service.id}">
                <i class="fas fa-edit"></i> Apply Now
            </button>
        `;
        
        // Add click event to apply button
        const applyBtn = serviceDiv.querySelector('.apply-btn');
        applyBtn.addEventListener('click', () => {
            console.log('Service card clicked:', service.name, service.id);
            showApplicationSection(service.name, service.id);
        });
        
        elements.servicesGrid.appendChild(serviceDiv);
    });
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const nic = document.getElementById('loginNic').value;
    console.log('Login NIC:', nic);
    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nic })
    })
    .then(response => {
        console.log('Login response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Login response data:', data);
        if (data.error) {
            showNotification(data.error, 'error');
        } else {
            // Store user data and token
            currentUser = data.user;
            localStorage.setItem('govbot_token', data.token);
            localStorage.setItem('govbot_user', JSON.stringify(data.user));
            
            // Join user room for real-time updates
            if (socket && currentUser && currentUser.id) {
                socket.emit('join_user', { user_id: currentUser.id });
            }

            // Update UI
            updateUIForUser();
            showNotification('Login successful!', 'success');
            
            // Show dashboard
            showDashboard();
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    });
}

function handleRegister(e) {
    e.preventDefault();
    console.log('Registration form submitted');
    
    const formData = {
        nic: document.getElementById('registerNic').value,
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        phone: document.getElementById('registerPhone').value,
        language: document.getElementById('registerLanguage').value
    };
    
    console.log('Form data:', formData);
    
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.error) {
            showNotification(data.error, 'error');
        } else {
            showNotification('Registration successful! Please login.', 'success');
            // Switch to login tab
            switchAuthTab('login');
            // Clear register form
            elements.registerForm.reset();
        }
    })
    .catch(error => {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    });
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('govbot_token');
    localStorage.removeItem('govbot_user');
    
    // Update UI
    updateUIForUser();
    showNotification('Logged out successfully', 'success');
    
    // Show welcome section
    showWelcomeSection();
}

function switchAuthTab(tab) {
    console.log('Switching to tab:', tab);
    
    // Update active tab
    elements.authTabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Show/hide forms
    if (tab === 'login') {
        console.log('Showing login form, hiding register form');
        elements.loginForm.classList.add('active');
        elements.registerForm.classList.remove('active');
    } else if (tab === 'register') {
        console.log('Showing register form, hiding login form');
        elements.registerForm.classList.add('active');
        elements.loginForm.classList.remove('active');
    }
}

// Application handling
function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('serviceId').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const documents = document.getElementById('documents').files;
    
    if (!serviceId || !appointmentDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Collect all form data from dynamic fields
    const formData = new FormData();
    formData.append('user_id', currentUser.id);
    formData.append('service_id', serviceId);
    formData.append('appointment_date', appointmentDate);
    
    // Collect dynamic form fields
    const dynamicFormData = {};
    const formSections = document.getElementById('formSections');
    const formFields = formSections.querySelectorAll('input, select, textarea');
    
    formFields.forEach(field => {
        if (field.name && field.value) {
            dynamicFormData[field.name] = field.value;
        }
    });
    
    // Add form data to FormData
    formData.append('form_data', JSON.stringify(dynamicFormData));
    
    // Add documents
    for (let i = 0; i < documents.length; i++) {
        formData.append('documents', documents[i]);
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    fetch('/api/applications', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        showNotification(`Application submitted successfully! Reference: ${data.reference_number}`, 'success');
        hideApplicationSection();
        // Refresh applications and stats, so recent list updates immediately
        loadUserApplications();
        loadDashboardSummary();
        
        // Reset form
        document.getElementById('applicationForm').reset();
    })
    .catch(error => {
        console.error('Error submitting application:', error);
        showNotification(error.message || 'Error submitting application', 'error');
    })
    .finally(() => {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}



// Dashboard functionality
function showDashboard() {
    elements.welcomeSection.style.display = 'none';
    elements.authSection.style.display = 'none';
    elements.dashboardSection.style.display = 'block';
    
    // Load user data
  loadUserApplications();
  loadDashboardSummary();
}

function showWelcomeSection() {
    elements.dashboardSection.style.display = 'none';
    elements.authSection.style.display = 'block';
    elements.welcomeSection.style.display = 'block';
}

function loadUserApplications() {
    if (!currentUser) return;
    
    fetch(`/api/applications/user/${currentUser.id}`)
        .then(response => response.json())
        .then(applications => {
            displayApplications(applications);
        })
        .catch(error => {
            console.error('Error loading applications:', error);
        });
}

function displayApplications(applications) {
    elements.applicationsList.innerHTML = '';
    
    if (applications.length === 0) {
        elements.applicationsList.innerHTML = '<p>No applications found.</p>';
        return;
    }
    
    applications.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'application-item';
        
        appDiv.innerHTML = `
            <h4>${app.service_name}</h4>
            <p><strong>Reference:</strong> ${app.reference_number}</p>
            <p><strong>Submitted:</strong> ${new Date(app.created_at).toLocaleDateString()}</p>
            <span class="application-status status-${app.status}">${app.status}</span>
        `;
        
        elements.applicationsList.appendChild(appDiv);
    });
    
    // Also update recent applications in dashboard
    const recentApplications = document.getElementById('recentApplications');
    if (recentApplications) {
        recentApplications.innerHTML = '';
        const recentApps = applications.slice(0, 3); // Show only 3 recent
        
        if (recentApps.length === 0) {
            recentApplications.innerHTML = '<p>No applications yet.</p>';
        } else {
            recentApps.forEach(app => {
                const appDiv = document.createElement('div');
                appDiv.className = 'recent-application-item';
                appDiv.innerHTML = `
                    <div class="recent-app-info">
                        <h4>${app.service_name}</h4>
                        <p>${app.reference_number}</p>
                    </div>
                    <span class="status-${app.status}">${app.status}</span>
                `;
                recentApplications.appendChild(appDiv);
            });
        }
    }
}

// Update dashboard statistics
function updateDashboardStatsFromSummary(summary) {
    const totalEl = document.getElementById('totalApplications');
    const pendingEl = document.getElementById('pendingApplications');
    const completedEl = document.getElementById('completedApplications');
    const complaintsEl = document.getElementById('totalComplaints');

    if (totalEl) totalEl.textContent = summary.totalApplications || 0;
    if (pendingEl) pendingEl.textContent = summary.pendingApplications || 0;
    if (completedEl) completedEl.textContent = summary.completedApplications || 0;
    if (complaintsEl && typeof summary.totalComplaints !== 'undefined') complaintsEl.textContent = summary.totalComplaints;
}

function renderRecentApplications(recentApps = []) {
    const recentApplications = document.getElementById('recentApplications');
    if (!recentApplications) return;
    recentApplications.innerHTML = '';

    if (!recentApps.length) {
        recentApplications.innerHTML = '<p>No applications yet.</p>';
        return;
    }

    recentApps.forEach(app => {
        const appDiv = document.createElement('div');
        appDiv.className = 'recent-application-item';
        appDiv.innerHTML = `
            <div class="recent-app-info">
                <h4>${app.service_name}</h4>
                <p>${app.reference_number}</p>
            </div>
            <span class="status-${app.status}">${app.status}</span>
        `;
        recentApplications.appendChild(appDiv);
    });
}

function loadDashboardSummary() {
    if (!currentUser) return;
    fetch(`/api/dashboard/user/${currentUser.id}`)
        .then(r => r.json())
        .then(summary => {
            updateDashboardStatsFromSummary(summary);
            renderRecentApplications(summary.recentApplications || []);
        })
        .catch(err => console.error('Failed to load dashboard summary:', err));
}

// Fetch and update total complaints for current user
function updateComplaintsStat() {
    if (!currentUser) return;
    fetch(`/api/complaints/user/${currentUser.id}/count`)
        .then(r => r.json())
        .then(({ total }) => {
            const complaintsEl = document.getElementById('totalComplaints');
            if (complaintsEl && typeof total !== 'undefined') {
                complaintsEl.textContent = total;
            }
        })
        .catch(err => console.error('Failed to load complaints count:', err));
}

// Complaint handling
function showComplaintForm() {
    const complaintFormSection = document.getElementById('complaintFormSection');
    if (complaintFormSection) {
        showSection('complaintFormSection');
    } else {
        showNotification('Complaint form not available', 'warning');
    }
}

// Navigation function
function navigateToPage(page) {
    // Hide all sections first
    const sections = [
        'welcomeSection', 'dashboardSection', 'servicesSection', 
        'applicationsSection', 'complaintsSection', 'chatSection', 
        'profileSection', 'applicationSection', 'complaintFormSection'
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Show the appropriate section
    switch(page) {
        case 'dashboard':
            showDashboard();
            break;
        case 'services':
            showServicesSection();
            break;
        case 'applications':
            showApplicationsSection();
            break;
        case 'complaints':
            showComplaintsSection();
            break;
        case 'chat':
            showChatSection();
            break;
        case 'profile':
            showProfileSection();
            break;
        default:
            showWelcomeSection();
    }
}

// Show applications section
function showApplicationsSection() {
    const applicationsSection = document.getElementById('applicationsSection');
    if (applicationsSection) {
        applicationsSection.style.display = 'block';
        loadUserApplications();
    }
}

// Show complaints section
function showComplaintsSection() {
    const complaintsSection = document.getElementById('complaintsSection');
    if (complaintsSection) {
        complaintsSection.style.display = 'block';
        loadUserComplaints();
    }
}

// Show profile section
function showProfileSection() {
    const profileSection = document.getElementById('profileSection');
    if (profileSection) {
        profileSection.style.display = 'block';
        loadUserProfile();
    }
}

// Load user complaints
function loadUserComplaints() {
    if (!currentUser) return;
    
    // This would fetch complaints from the API
    // For now, show empty state
    const complaintsList = document.getElementById('complaintsList');
    if (complaintsList) {
        complaintsList.innerHTML = '<p>No complaints found.</p>';
    }
}

// Load user profile
function loadUserProfile() {
    if (!currentUser) return;
    
    const profileInfo = document.getElementById('profileInfo');
    if (profileInfo) {
        profileInfo.innerHTML = `
            <div class="profile-field">
                <label>NIC:</label>
                <span>${currentUser.nic}</span>
            </div>
            <div class="profile-field">
                <label>Name:</label>
                <span>${currentUser.name}</span>
            </div>
            <div class="profile-field">
                <label>Language:</label>
                <span>${currentUser.language}</span>
            </div>
        `;
    }
}

// Hide complaint form
function hideComplaintForm() {
    const complaintFormSection = document.getElementById('complaintFormSection');
    if (complaintFormSection) {
        complaintFormSection.style.display = 'none';
    }
}

// Handle complaint submission
function handleComplaintSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login to submit a complaint', 'error');
        return;
    }
    
    const subject = document.getElementById('complaintSubject').value;
    const description = document.getElementById('complaintDescription').value;
    
    fetch('/api/complaints', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: currentUser.id,
            subject: subject,
            description: description
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showNotification(data.error, 'error');
        } else {
            showNotification('Complaint submitted successfully!', 'success');
            hideComplaintForm();
            document.getElementById('complaintForm').reset();

            // Optimistically refresh complaints count/stat
            updateComplaintsStat();
        }
    })
    .catch(error => {
        console.error('Complaint submission error:', error);
        showNotification('Complaint submission failed. Please try again.', 'error');
    });
}

// Utility functions
function checkAuthStatus() {
    const token = localStorage.getItem('govbot_token');
    const user = localStorage.getItem('govbot_user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        updateUIForUser();
        showDashboard();
    }
}

function updateUIForUser() {
    if (currentUser) {
        elements.userSection.style.display = 'flex';
        elements.userName.textContent = currentUser.name;
        elements.authSection.style.display = 'none';
    } else {
        elements.userSection.style.display = 'none';
        elements.authSection.style.display = 'block';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageSpan = document.getElementById('notificationMessage');
    
    messageSpan.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Close notification
document.getElementById('closeNotification').addEventListener('click', () => {
    document.getElementById('notification').style.display = 'none';
});

// (handled by setupSocketHandlers)

// Geolocation for finding nearest offices
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                findNearestOffices(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                showNotification('Unable to get your location', 'warning');
            }
        );
    } else {
        showNotification('Geolocation not supported by this browser', 'warning');
    }
}

function findNearestOffices(latitude, longitude) {
    fetch(`/api/offices/nearest?latitude=${latitude}&longitude=${longitude}`)
        .then(response => response.json())
        .then(offices => {
            // Display nearest offices
            console.log('Nearest offices:', offices);
        })
        .catch(error => {
            console.error('Error finding offices:', error);
        });
}

// Add some sample chat responses for demonstration
const sampleResponses = {
    english: {
        'hello': 'Hello! How can I help you today?',
        'help': 'I can help you with government services like NIC renewal, passport, birth certificate, and more. What do you need?',
        'office': 'I can help you find the nearest government office. Would you like me to use your location?',
        'documents': 'I can help you with various documents and certificates. What specific document do you need?'
    },
    sinhala: {
        'hello': 'ආයුබෝවන්! අද මට ඔබට කෙසේ උදව් කළ හැකිද?',
        'help': 'මට ඔබට උදව් කළ හැක්කේ NIC අලුත් කිරීම, passport, උපත සහතිකය, සහ තවත් බොහෝ දේ. ඔබට අවශ්‍ය කුමක්ද?',
        'office': 'මට ඔබට ආසන්නතම රජයේ කාර්යාලය සොයා ගැනීමට උදව් කළ හැකිය. ඔබේ ස්ථානය භාවිතා කිරීමට අවශ්‍යද?',
        'documents': 'මට ඔබට විවිධ ලේඛන සහ සහතික සම්බන්ධයෙන් උදව් කළ හැකිය. ඔබට අවශ්‍ය නිශ්චිත ලේඛනය කුමක්ද?'
    },
    tamil: {
        'hello': 'வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        'help': 'நான் NIC புதுப்பித்தல், passport, பிறப்பு சான்றிதழ் மற்றும் பலவற்றில் உங்களுக்கு உதவ முடியும். உங்களுக்கு என்ன தேவை?',
        'office': 'நான் உங்களுக்கு அருகிலுள்ள அரசு அலுவலகத்தை கண்டுபிடிக்க உதவ முடியும். உங்கள் இருப்பிடத்தைப் பயன்படுத்த விரும்புகிறீர்களா?',
        'documents': 'நான் பல்வேறு ஆவணங்கள் மற்றும் சான்றிதழ்களில் உங்களுக்கு உதவ முடியும். உங்களுக்கு என்ன குறிப்பிட்ட ஆவணம் தேவை?'
    }
};

// Enhanced chat functionality with sample responses
function getSampleResponse(message) {
    const langResponses = sampleResponses[currentLanguage] || sampleResponses.english;
    
    for (const [keyword, response] of Object.entries(langResponses)) {
        if (message.toLowerCase().includes(keyword)) {
            return response;
        }
    }
    
    return langResponses.help || 'I can help you with government services. What do you need?';
}
