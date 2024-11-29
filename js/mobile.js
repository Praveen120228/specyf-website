document.addEventListener('DOMContentLoaded', function() {
    // Universal Mobile Menu Functionality
    function setupMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        // Ensure both toggle and nav links exist
        if (!mobileMenuToggle || !navLinks) {
            console.log('Mobile menu elements not found');
            return;
        }

        // Prevent scrolling when menu is open
        function toggleBodyScroll(isMenuOpen) {
            document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        }

        // Close menu function
        function closeMenu() {
            navLinks.classList.remove('active');
            toggleBodyScroll(false);
            
            // Reset menu icon
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }

        // Toggle menu visibility
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent immediate closing
            
            // Toggle active class for slide-in effect
            navLinks.classList.toggle('active');
            
            // Toggle body scroll
            toggleBodyScroll(navLinks.classList.contains('active'));
            
            // Toggle menu icon
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
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });

        // Ensure menu links close the menu when clicked
        const menuLinks = navLinks.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });
    }

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
        setupMobileMenu();
        optimizeTouchTargets();
        preventHorizontalScroll();
    }

    // Run optimizations
    initMobileOptimizations();
});
