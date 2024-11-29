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

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        // Toggle menu visibility
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent immediate closing
            navLinks.classList.toggle('active');
            
            // Optional: Toggle menu icon if you want visual feedback
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            // Check if menu is open and click is outside nav and toggle
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(event.target) && 
                !mobileMenuToggle.contains(event.target)) {
                navLinks.classList.remove('active');
                
                // Reset menu icon if applicable
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
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
});
