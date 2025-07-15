  document.addEventListener("DOMContentLoaded", function() {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            const navToggle = document.getElementById('navToggle');
            const navLinks = document.getElementById('navLinks');
            
            if (navToggle && navLinks) {
                navToggle.addEventListener('click', function() {
                    navLinks.classList.toggle('active');
                });

                document.addEventListener('click', function(e) {
                    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                        navLinks.classList.remove('active');
                    }
                });
            }
        });

        setTimeout(function() {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);