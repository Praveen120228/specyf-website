document.addEventListener('DOMContentLoaded', function() {
    // Universal Mobile Menu Functionality
    function setupMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
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
            
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }

        // Touch event handling
        let touchStartX = 0;
        let touchEndX = 0;

        // Add touch events for swipe gestures
        navLinks.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        navLinks.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        // Handle swipe gesture
        function handleSwipe() {
            const SWIPE_THRESHOLD = 50;
            const swipeDistance = touchEndX - touchStartX;
            
            if (swipeDistance > SWIPE_THRESHOLD) {
                // Swipe right - close menu
                closeMenu();
            }
        }

        // Toggle menu visibility with improved animation
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            requestAnimationFrame(() => {
                navLinks.classList.toggle('active');
                toggleBodyScroll(navLinks.classList.contains('active'));
                
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(event.target) && 
                !mobileMenuToggle.contains(event.target)) {
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });

        // Handle navigation links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
    }

    // Optimize touch interactions
    function optimizeTouchTargets() {
        const touchTargets = document.querySelectorAll('button, .button, .nav-links a, .card, .service-card');
        
        touchTargets.forEach(target => {
            // Add touch feedback
            target.addEventListener('touchstart', () => {
                target.style.transform = 'scale(0.98)';
            }, { passive: true });

            target.addEventListener('touchend', () => {
                target.style.transform = 'scale(1)';
            }, { passive: true });

            // Ensure minimum touch target size
            if (target.offsetWidth < 48 || target.offsetHeight < 48) {
                target.style.minWidth = '48px';
                target.style.minHeight = '48px';
            }
        });
    }

    // Lazy load images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Smooth scrolling for anchor links
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
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
    }

    // Initialize all mobile optimizations
    function initMobileOptimizations() {
        setupMobileMenu();
        optimizeTouchTargets();
        lazyLoadImages();
        setupSmoothScrolling();
    }

    // Run optimizations
    initMobileOptimizations();
});
