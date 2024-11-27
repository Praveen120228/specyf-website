// Service details data
const serviceDetails = {
    home: {
        title: 'Home Services',
        description: `Our home services division provides professional staff for all your residential needs. 
        We understand that your home is your sanctuary, and our carefully selected personnel are trained 
        to maintain the highest standards of service.`,
        features: [
            'Experienced and background-checked housekeepers',
            'Professional nannies and childcare specialists',
            'Personal assistants and household managers',
            'Flexible scheduling options',
            'Emergency staff replacement',
            'Regular performance monitoring'
        ],
        pricing: 'Starting from $25/hour',
        availability: '24/7 service available'
    },
    industrial: {
        title: 'Industrial Staffing',
        description: `Our industrial staffing solutions cater to manufacturing, logistics, and industrial 
        operations. We provide skilled workers who understand safety protocols and operational excellence.`,
        features: [
            'Skilled manufacturing workers',
            'Warehouse and logistics personnel',
            'Safety-trained staff',
            'Quality control specialists',
            'Maintenance technicians',
            'Shift supervisors'
        ],
        pricing: 'Customized quotes based on requirements',
        availability: 'Round-the-clock staffing available'
    },
    corporate: {
        title: 'Corporate Staffing',
        description: `Elevate your office environment with our professional corporate staffing solutions. 
        We provide qualified personnel who can seamlessly integrate into your corporate culture.`,
        features: [
            'Administrative assistants',
            'Reception and front desk staff',
            'Data entry specialists',
            'Office managers',
            'Executive assistants',
            'Customer service representatives'
        ],
        pricing: 'Competitive rates with volume discounts',
        availability: 'Regular business hours and extended support'
    },
    urgent: {
        title: 'Urgent Staffing',
        description: `Need staff immediately? Our urgent staffing service provides quick response solutions 
        for immediate requirements. Premium service with same-day placement available.`,
        features: [
            'Same-day staff placement',
            'Pre-screened and ready-to-work personnel',
            '24/7 emergency support',
            'Immediate replacement if needed',
            'Priority processing',
            'Premium customer service'
        ],
        pricing: 'Premium rates apply for urgent services',
        availability: 'Immediate response guaranteed'
    }
};

// Modal functionality
const modal = document.getElementById('service-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.querySelector('.close-modal');

function showServiceDetails(serviceType) {
    const service = serviceDetails[serviceType];
    if (!service) return;

    modalContent.innerHTML = `
        <h2>${service.title}</h2>
        <p class="service-description">${service.description}</p>
        <div class="service-details">
            <h3>Key Features:</h3>
            <ul>
                ${service.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <div class="service-meta">
                <p><strong>Pricing:</strong> ${service.pricing}</p>
                <p><strong>Availability:</strong> ${service.availability}</p>
            </div>
        </div>
        <a href="login.html" class="cta-button">Get Started</a>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Add animation to cards on scroll
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});
