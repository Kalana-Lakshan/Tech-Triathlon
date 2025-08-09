// Business Services JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Business Services page loaded');

    // Initialize the page
    initializePage();
    
    // Setup event listeners
    setupEventListeners();
});

function initializePage() {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function setupEventListeners() {
    // Service card button interactions
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            const serviceCard = this.closest('.service-card');
            const serviceName = serviceCard.querySelector('h4').textContent;
            
            // Show application modal or redirect to main application form
            showApplicationModal(serviceName);
        });
    });

    document.querySelectorAll('.btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            const serviceCard = this.closest('.service-card');
            const serviceName = serviceCard.querySelector('h4').textContent;
            
            // Show service details modal
            showServiceDetails(serviceName);
        });
    });

    // Contact method interactions
    document.querySelectorAll('.contact-method').forEach(method => {
        method.addEventListener('click', function() {
            const methodType = this.querySelector('h4').textContent;
            handleContactMethod(methodType);
        });
    });

    // Social media link interactions
    document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className.split(' ')[1].replace('fa-', '');
            handleSocialMediaClick(platform);
        });
    });

    // Navigation link interactions
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            const target = this.getAttribute('href');
            if (target && target !== '#') {
                // Add loading state
                this.style.opacity = '0.7';
                setTimeout(() => {
                    this.style.opacity = '1';
                }, 200);
            }
        });
    });
}

function showApplicationModal(serviceName) {
    // Create modal for application
    const modal = document.createElement('div');
    modal.className = 'application-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Apply for ${serviceName}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>You will be redirected to the main application form to complete your application for ${serviceName}.</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="redirectToApplication('${serviceName}')">Continue to Application</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .application-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .modal-header h3 {
            color: #1e3c72;
            margin: 0;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6c757d;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .close-btn:hover {
            background: #f8f9fa;
            color: #495057;
        }
        
        .modal-body p {
            color: #6c757d;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        
        .modal-actions {
            display: flex;
            gap: 1rem;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;

    document.head.appendChild(modalStyles);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close button functionality
    modal.querySelector('.close-btn').addEventListener('click', closeModal);
}

function showServiceDetails(serviceName) {
    // Create modal for service details
    const modal = document.createElement('div');
    modal.className = 'service-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${serviceName} - Service Details</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="service-details">
                    <h4>What is included?</h4>
                    <ul>
                        <li>Professional consultation</li>
                        <li>Document preparation assistance</li>
                        <li>Application submission support</li>
                        <li>Status tracking</li>
                        <li>Follow-up assistance</li>
                    </ul>
                    
                    <h4>Requirements</h4>
                    <ul>
                        <li>Valid identification documents</li>
                        <li>Business registration (if applicable)</li>
                        <li>Proof of address</li>
                        <li>Application fee payment</li>
                    </ul>
                    
                    <h4>Processing Time</h4>
                    <p>Most applications are processed within 5-7 business days.</p>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="redirectToApplication('${serviceName}')">Apply Now</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .service-details-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        
        .service-details h4 {
            color: #1e3c72;
            margin: 1.5rem 0 0.5rem 0;
            font-size: 1.1rem;
        }
        
        .service-details ul {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }
        
        .service-details li {
            margin-bottom: 0.3rem;
            color: #495057;
        }
        
        .service-details p {
            color: #6c757d;
            margin-bottom: 1.5rem;
        }
    `;

    document.head.appendChild(modalStyles);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close button functionality
    modal.querySelector('.close-btn').addEventListener('click', closeModal);
}

function closeModal() {
    const modals = document.querySelectorAll('.application-modal, .service-details-modal');
    modals.forEach(modal => {
        modal.remove();
    });
}

function redirectToApplication(serviceName) {
    // Redirect to main application form with service pre-selected
    const encodedService = encodeURIComponent(serviceName);
    window.location.href = `index.html?service=${encodedService}`;
}

function handleContactMethod(methodType) {
    switch(methodType) {
        case 'Call Us':
            // Show phone number with copy functionality
            showContactInfo('Phone: +94 11 123 4567', 'Call Us');
            break;
        case 'Email Us':
            // Show email with copy functionality
            showContactInfo('Email: business@govbot.lk', 'Email Us');
            break;
        case 'Live Chat':
            // Redirect to main chat
            window.location.href = 'index.html#chatSection';
            break;
    }
}

function showContactInfo(info, title) {
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'contact-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${info}</p>
            <button class="btn btn-primary" onclick="copyToClipboard('${info}')">Copy</button>
            <button class="btn btn-secondary" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;

    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .contact-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        }
        
        .notification-content {
            padding: 1.5rem;
        }
        
        .notification-content h4 {
            color: #1e3c72;
            margin-bottom: 0.5rem;
        }
        
        .notification-content p {
            color: #495057;
            margin-bottom: 1rem;
        }
        
        .notification-content .btn {
            margin-right: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;

    document.head.appendChild(notificationStyles);
    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

function copyToClipboard(text) {
    // Extract the actual contact info from the text
    const contactInfo = text.split(': ')[1];
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(contactInfo).then(() => {
            showCopySuccess();
        }).catch(() => {
            fallbackCopyTextToClipboard(contactInfo);
        });
    } else {
        fallbackCopyTextToClipboard(contactInfo);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
}

function showCopySuccess() {
    const success = document.createElement('div');
    success.className = 'copy-success';
    success.textContent = 'Copied to clipboard!';
    
    // Add success styles
    const successStyles = document.createElement('style');
    successStyles.textContent = `
        .copy-success {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            z-index: 1001;
            animation: fadeInOut 2s ease;
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;

    document.head.appendChild(successStyles);
    document.body.appendChild(success);

    // Remove after animation
    setTimeout(() => {
        if (success.parentElement) {
            success.remove();
        }
    }, 2000);
}

function handleSocialMediaClick(platform) {
    // Show platform-specific message
    const messages = {
        facebook: 'Redirecting to Facebook page...',
        twitter: 'Redirecting to Twitter page...',
        linkedin: 'Redirecting to LinkedIn page...',
        youtube: 'Redirecting to YouTube channel...'
    };

    const message = messages[platform] || 'Redirecting to social media...';
    
    // Create redirect notification
    const notification = document.createElement('div');
    notification.className = 'social-redirect-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fab fa-${platform}"></i>
            <p>${message}</p>
        </div>
    `;

    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .social-redirect-notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: scaleIn 0.3s ease;
            padding: 2rem;
            text-align: center;
        }
        
        .social-redirect-notification i {
            font-size: 3rem;
            color: #667eea;
            margin-bottom: 1rem;
        }
        
        .social-redirect-notification p {
            color: #495057;
            font-size: 1.1rem;
        }
        
        @keyframes scaleIn {
            from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    `;

    document.head.appendChild(notificationStyles);
    document.body.appendChild(notification);

    // Remove after 2 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 2000);
}

// Add scroll reveal effect
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.service-card, .info-card, .contact-method');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate');
        }
    });
});

// Add CSS for scroll animations
const scrollAnimationStyles = document.createElement('style');
scrollAnimationStyles.textContent = `
    .service-card, .info-card, .contact-method {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .service-card.animate, .info-card.animate, .contact-method.animate {
        opacity: 1;
        transform: translateY(0);
    }
`;

document.head.appendChild(scrollAnimationStyles);
