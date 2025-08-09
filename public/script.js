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
    
    // Set up language selector
    elements.languageSelect.value = currentLanguage;
    
    // Set initial language
    updateLanguage(currentLanguage);
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
    elements.newApplicationBtn.addEventListener('click', showServicesSection);
    elements.submitComplaintBtn.addEventListener('click', showComplaintForm);
    
    // Service categories
    document.querySelectorAll('.service-category').forEach(category => {
        category.addEventListener('click', () => {
            showServicesList(category.dataset.category);
        });
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
        newApplicationFromList.addEventListener('click', showServicesSection);
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
    // Hide all sections
    Object.values(elements).forEach(element => {
        if (element && element.classList && element.classList.contains('section')) {
            element.style.display = 'none';
        }
    });
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
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
    elements.welcomeSection.style.display = 'none';
    elements.servicesSection.style.display = 'block';
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
    elements.applicationSection.style.display = 'block';
    document.getElementById('serviceName').value = serviceName;
    document.getElementById('serviceId').value = serviceId; // Assuming serviceId is in the form
}

function hideApplicationSection() {
    elements.applicationSection.style.display = 'none';
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
    elements.servicesList.style.display = 'block';
    elements.selectedCategoryTitle.textContent = category;
    
    // Fetch services for the selected category
    fetch(`/api/services/${encodeURIComponent(category)}`)
        .then(response => response.json())
        .then(services => {
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
    
    if (!currentUser) {
        showNotification('Please login to submit an application', 'error');
        return;
    }
    
    const serviceName = document.getElementById('serviceName').value;
    const serviceId = document.getElementById('serviceId').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const documents = document.getElementById('documents').files;
    
    if (!serviceName || !serviceId || !appointmentDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('user_id', currentUser.id);
    formData.append('service_id', serviceId);
    formData.append('appointment_date', appointmentDate);
    
    for (let i = 0; i < documents.length; i++) {
        formData.append('documents', documents[i]);
    }
    
    fetch('/api/applications', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showNotification(data.error, 'error');
        } else {
            showNotification(`Application submitted successfully! Reference: ${data.reference_number}`, 'success');
            hideApplicationSection();
            elements.applicationForm.reset();
            
            // Refresh dashboard and applications
            loadUserApplications();
            updateDashboardStats();
        }
    })
    .catch(error => {
        console.error('Application submission error:', error);
        showNotification('Application submission failed. Please try again.', 'error');
    });
}



// Dashboard functionality
function showDashboard() {
    elements.welcomeSection.style.display = 'none';
    elements.authSection.style.display = 'none';
    elements.dashboardSection.style.display = 'block';
    
    // Load user data
    loadUserApplications();
    updateDashboardStats();
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
            updateDashboardStats(applications);
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
function updateDashboardStats(applications = []) {
    if (!applications.length) {
        // If no applications provided, fetch them
        if (currentUser) {
            fetch(`/api/applications/user/${currentUser.id}`)
                .then(response => response.json())
                .then(apps => updateDashboardStats(apps))
                .catch(error => console.error('Error loading applications for stats:', error));
        }
        return;
    }
    
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const completedApplications = applications.filter(app => 
        app.status === 'approved' || app.status === 'completed'
    ).length;
    
    // Update dashboard stats
    const totalEl = document.getElementById('totalApplications');
    const pendingEl = document.getElementById('pendingApplications');
    const completedEl = document.getElementById('completedApplications');
    
    if (totalEl) totalEl.textContent = totalApplications;
    if (pendingEl) pendingEl.textContent = pendingApplications;
    if (completedEl) completedEl.textContent = completedApplications;
}

// Complaint handling
function showComplaintForm() {
    // This would show a complaint form modal
    showNotification('Complaint feature coming soon!', 'warning');
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

// Socket.IO event handlers
if (socket) {
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('chat_message', (data) => {
        // Handle incoming chat messages
        console.log('Received message:', data);
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

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
