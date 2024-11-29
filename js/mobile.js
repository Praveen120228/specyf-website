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
        // Prevent scrolling when menu is open
        function toggleBodyScroll(isMenuOpen) {
            document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        }

        // Toggle menu visibility
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent immediate closing
            
            // Toggle active class for slide-in effect
            navLinks.classList.toggle('active');
            
            // Toggle body scroll
            toggleBodyScroll(navLinks.classList.contains('active'));
            
            // Optional: Toggle menu icon
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
                
                // Remove active class
                navLinks.classList.remove('active');
                
                // Restore body scroll
                toggleBodyScroll(false);
                
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
