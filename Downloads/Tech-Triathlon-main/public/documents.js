// Documents & Certificates Page JavaScript

// Global variables
let currentUser = null;
let currentLanguage = 'english';
let socket = null;

// DOM elements
const elements = {
    // Sections
    applicationSection: document.getElementById('applicationSection'),
    
    // Buttons
    applyBtns: document.querySelectorAll('.apply-btn'),
    closeApplicationBtn: document.getElementById('closeApplicationBtn'),
    cancelApplicationBtn: document.getElementById('cancelApplicationBtn'),
    sendMessageBtn: document.getElementById('sendMessageBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    minimizeChat: document.getElementById('minimizeChat'),
    
    // Forms
    applicationForm: document.getElementById('applicationForm'),
    
    // Inputs
    chatInput: document.getElementById('chatInput'),
    languageSelect: document.getElementById('languageSelect'),
    serviceName: document.getElementById('serviceName'),
    applicantName: document.getElementById('applicantName'),
    applicantNIC: document.getElementById('applicantNIC'),
    appointmentDate: document.getElementById('appointmentDate'),
    documents: document.getElementById('documents'),
    additionalInfo: document.getElementById('additionalInfo'),
    
    // Other elements
    chatMessages: document.getElementById('chatMessages'),
    chatWidget: document.getElementById('chatWidget'),
    chatHeader: document.getElementById('chatHeader'),
    chatBody: document.getElementById('chatBody'),
    userSection: document.getElementById('userSection'),
    userName: document.getElementById('userName')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    setupChatWidget();
});

// Initialize the application
function initializeApp() {
    // Initialize Socket.IO
    socket = io();
    
    // Set up language selector
    if (elements.languageSelect) {
        elements.languageSelect.value = currentLanguage;
    }
    
    // Set initial language
    updateLanguage(currentLanguage);
    
    // Set minimum date for appointment (today)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    elements.appointmentDate.min = tomorrow.toISOString().slice(0, 16);
}

// Set up event listeners
function setupEventListeners() {
    // Language selector
    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            updateLanguage(currentLanguage);
        });
    }
    
    // Apply buttons
    elements.applyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceName = e.target.getAttribute('data-service');
            showApplicationForm(serviceName);
        });
    });
    
    // Close buttons
    elements.closeApplicationBtn.addEventListener('click', hideApplicationForm);
    elements.cancelApplicationBtn.addEventListener('click', hideApplicationForm);
    
    // Application form
    elements.applicationForm.addEventListener('submit', handleApplicationSubmit);
    
    // Chat functionality
    elements.sendMessageBtn.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Chat widget controls
    elements.chatHeader.addEventListener('click', toggleChat);
    elements.minimizeChat.addEventListener('click', toggleChat);
    
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
}

// Language management
function updateLanguage(language) {
    currentLanguage = language;
    
    // Update all elements with language data attributes
    document.querySelectorAll('[data-english], [data-sinhala], [data-tamil]').forEach(element => {
        const text = element.getAttribute(`data-${language}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholders
    if (elements.chatInput) {
        const placeholder = elements.chatInput.getAttribute(`data-${language}`);
        if (placeholder) {
            elements.chatInput.placeholder = placeholder;
        }
    }
}

// Application form management
function showApplicationForm(serviceName) {
    elements.serviceName.value = serviceName;
    elements.applicationSection.style.display = 'block';
    elements.applicationSection.classList.add('fade-in');
    
    // Scroll to form
    elements.applicationSection.scrollIntoView({ behavior: 'smooth' });
}

function hideApplicationForm() {
    elements.applicationSection.style.display = 'none';
    elements.applicationForm.reset();
}

// Handle application submission
function handleApplicationSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateApplicationForm()) {
        return;
    }
    
    // Show loading state
    const submitBtn = elements.applicationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData();
    formData.append('service', elements.serviceName.value);
    formData.append('applicantName', elements.applicantName.value);
    formData.append('applicantNIC', elements.applicantNIC.value);
    formData.append('appointmentDate', elements.appointmentDate.value);
    formData.append('additionalInfo', elements.additionalInfo.value);
    
    // Add documents
    const documentFiles = elements.documents.files;
    for (let i = 0; i < documentFiles.length; i++) {
        formData.append('documents', documentFiles[i]);
    }
    
    // Submit application
    fetch('/api/applications', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Application submitted successfully!', 'success');
            hideApplicationForm();
        } else {
            showNotification(data.message || 'Failed to submit application', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while submitting the application', 'error');
    })
    .finally(() => {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Validate application form
function validateApplicationForm() {
    const requiredFields = ['applicantName', 'applicantNIC', 'appointmentDate'];
    
    for (const fieldName of requiredFields) {
        const field = elements[fieldName];
        if (!field.value.trim()) {
            showNotification(`Please fill in ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            field.focus();
            return false;
        }
    }
    
    // Validate NIC format (Sri Lankan NIC)
    const nicRegex = /^[0-9]{9}[vVxX]$/;
    if (!nicRegex.test(elements.applicantNIC.value)) {
        showNotification('Please enter a valid NIC number (9 digits followed by V or X)', 'error');
        elements.applicantNIC.focus();
        return false;
    }
    
    // Validate appointment date (must be future date)
    const appointmentDate = new Date(elements.appointmentDate.value);
    const now = new Date();
    if (appointmentDate <= now) {
        showNotification('Please select a future appointment date', 'error');
        elements.appointmentDate.focus();
        return false;
    }
    
    return true;
}

// Chat functionality
function setupChatWidget() {
    // Initialize chat widget
    elements.chatWidget.classList.add('fade-in');
}

function toggleChat() {
    const isVisible = elements.chatBody.style.display !== 'none';
    elements.chatBody.style.display = isVisible ? 'none' : 'block';
    
    // Update minimize button icon
    const icon = elements.minimizeChat.querySelector('i');
    icon.className = isVisible ? 'fas fa-plus' : 'fas fa-minus';
}

function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    elements.chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate bot response (replace with actual AI integration)
    setTimeout(() => {
        hideTypingIndicator();
        const botResponse = getBotResponse(message);
        addMessageToChat(botResponse, 'bot');
    }, 1000 + Math.random() * 2000);
}

function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <div class="message-text">${message}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content user-message-content">
                <div class="message-text">${message}</div>
            </div>
        `;
    }
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <i class="fas fa-robot"></i>
            <div class="message-text">Typing...</div>
        </div>
    `;
    elements.chatMessages.appendChild(typingDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Document-specific responses
    if (lowerMessage.includes('nic') || lowerMessage.includes('identity')) {
        return "For NIC applications, you'll need to provide your birth certificate, proof of address, and a recent photograph. The processing time is usually 2-3 weeks.";
    } else if (lowerMessage.includes('passport')) {
        return "Passport applications require your NIC, birth certificate, and proof of address. Processing time is typically 3-4 weeks. You can also apply for expedited processing.";
    } else if (lowerMessage.includes('birth') || lowerMessage.includes('certificate')) {
        return "Birth certificates can be obtained from the Registrar General's Department. You'll need your parents' NICs and marriage certificate if applicable.";
    } else if (lowerMessage.includes('marriage')) {
        return "Marriage certificates are issued by the Registrar General's Department. Both parties must be present with their NICs and witnesses.";
    } else if (lowerMessage.includes('police') || lowerMessage.includes('clearance')) {
        return "Police clearance certificates are processed by the Criminal Records Division. You'll need your NIC and a letter stating the purpose of the clearance.";
    } else if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
        return "Appointments can be scheduled through our online system. Please select your preferred date and time from the available slots.";
    } else if (lowerMessage.includes('documents') || lowerMessage.includes('required')) {
        return "Required documents vary by service. Generally, you'll need your NIC, proof of address, and any relevant certificates. Check the specific service page for details.";
    } else if (lowerMessage.includes('processing') || lowerMessage.includes('time')) {
        return "Processing times vary by service: NIC (2-3 weeks), Passport (3-4 weeks), Birth Certificate (1-2 weeks), Marriage Certificate (2-3 weeks).";
    } else if (lowerMessage.includes('fee') || lowerMessage.includes('cost')) {
        return "Fees vary by service. NIC applications are typically free for first-time applicants, while passports cost around LKR 15,000. Check our fee schedule for details.";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
        return "I'm here to help you with document applications! You can ask me about requirements, processing times, fees, or how to apply for specific services.";
    } else {
        return "Thank you for your message. I'm here to help you with document applications. You can ask me about specific services, requirements, or processing times.";
    }
}

// Authentication functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token with server
        fetch('/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                currentUser = data.user;
                updateUIForUser();
            } else {
                localStorage.removeItem('authToken');
            }
        })
        .catch(error => {
            console.error('Auth verification error:', error);
            localStorage.removeItem('authToken');
        });
    }
}

function updateUIForUser() {
    if (currentUser) {
        elements.userSection.style.display = 'flex';
        elements.userName.textContent = currentUser.name;
        
        // Pre-fill form fields if available
        if (elements.applicantName) {
            elements.applicantName.value = currentUser.name;
        }
        if (elements.applicantNIC) {
            elements.applicantNIC.value = currentUser.nic;
        }
    } else {
        elements.userSection.style.display = 'none';
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    updateUIForUser();
    showNotification('Logged out successfully', 'success');
}

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Close notification
document.getElementById('closeNotification').addEventListener('click', function() {
    document.getElementById('notification').style.display = 'none';
});

// Add user message styling
const style = document.createElement('style');
style.textContent = `
    .user-message-content {
        background: #667eea !important;
        color: white !important;
        margin-left: auto;
        max-width: 80%;
    }
    
    .typing-indicator .message-text {
        font-style: italic;
        opacity: 0.7;
    }
    
    .notification.error {
        background: #ff4757;
        color: white;
    }
    
    .notification.success {
        background: #2ed573;
        color: white;
    }
`;
document.head.appendChild(style);
