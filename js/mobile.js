document.addEventListener('DOMContentLoaded', function() {
    // Optimize touch interactions
    function optimizeTouchTargets() {
        const touchElements = document.querySelectorAll('a, button, .service-card, .nav-links a');
        touchElements.forEach(el => {
            el.addEventListener('touchstart', function(e) {
                this.classList.add('touch-active');
            });
            el.addEventListener('touchend', function(e) {
                this.classList.remove('touch-active');
            });
        });
    }

    // Prevent horizontal scroll on mobile
    function preventHorizontalScroll() {
        document.body.style.maxWidth = '100%';
        document.body.style.overflowX = 'hidden';
    }

    // Initialize mobile optimizations
    function initMobileOptimizations() {
        optimizeTouchTargets();
        preventHorizontalScroll();
    }

    // Run optimizations
    initMobileOptimizations();

    // Responsive menu toggle (if exists)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && 
                !mobileMenuToggle.contains(event.target) && 
                navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }
});
