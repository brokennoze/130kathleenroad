document.addEventListener('DOMContentLoaded', () => {

    // === Navigation Scroll Effect ===
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // === Mobile Menu Toggle ===
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileLinks = document.querySelector('.mobile-links');
    const mobileLinksAnchors = document.querySelectorAll('.mobile-links a');

    mobileMenuBtn.addEventListener('click', () => {
        const icon = mobileMenuBtn.querySelector('i');
        mobileLinks.classList.toggle('active');

        if (mobileLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu on link click
    mobileLinksAnchors.forEach(link => {
        link.addEventListener('click', () => {
            mobileLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // === Scroll Reveal Animations ===
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Optional: only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Trigger hero animations immediately if already in view
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero .reveal-up');
        heroElements.forEach(el => el.classList.add('active'));
    }, 100);


    // === Form Handling ===
    const bookingForm = document.getElementById('bookingForm');
    const formSuccess = document.getElementById('formSuccess');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            // Loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Collect form data
            const formData = new FormData(bookingForm);

            // Alert if testing locally via file://
            if (window.location.protocol === 'file:') {
                alert('LOCAL TEST NOTICE: Browser security might block form submission from a local file. For best results, run on a local server or test the live site.');
            }

            // Send to internal API
            fetch("/api/request-viewing", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            })
                .then(response => response.json())
                .then(data => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;

                    if (data.success) {
                        // Hide form, show success
                        bookingForm.reset();
                        formSuccess.classList.add('active');

                        // Reset success message after 5 seconds
                        setTimeout(() => {
                            formSuccess.classList.remove('active');
                        }, 5000);
                    } else {
                        console.error('API Error:', data);
                        alert('Oops! There was a problem submitting your form. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Fetch Error:', error);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    alert('Oops! There was a network error. Please try again.');
                });
        });
    }

    // === Lightbox / Slideshow Logic ===
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    let currentImgIndex = 0;
    const images = [];

    // Collect all gallery images
    galleryItems.forEach((img, index) => {
        images.push({
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || 'Property Image'
        });

        // Add click listener to the parent gallery-item
        img.parentElement.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    const openLightbox = (index) => {
        currentImgIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const updateLightboxImage = () => {
        const img = images[currentImgIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.innerText = img.alt;
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    };

    const nextImage = () => {
        currentImgIndex = (currentImgIndex + 1) % images.length;
        updateLightboxImage();
    };

    const prevImage = () => {
        currentImgIndex = (currentImgIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    };

    // Event Listeners
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
    });
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
    });

    // Close on background click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard Support
    window.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        console.log('Key pressed:', e.key); // Debug log

        if (e.key === 'Escape' || e.keyCode === 27) {
            closeLightbox();
        }
        if (e.key === 'ArrowRight' || e.keyCode === 39) {
            nextImage();
        }
        if (e.key === 'ArrowLeft' || e.keyCode === 37) {
            prevImage();
        }
    });
    // === Interactive Floorplan Logic ===
    const hotspots = document.querySelectorAll('.fp-hotspot');
    const fpContainer = document.getElementById('fpContainer');
    const flythroughViewer = document.getElementById('flythroughViewer');
    const flythroughImage = document.getElementById('flythroughImage');
    const flythroughClose = document.getElementById('flythroughClose');

    if (hotspots.length > 0 && fpContainer && flythroughViewer) {
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('click', (e) => {
                const imageSrc = hotspot.getAttribute('data-image');
                
                // Get the center coordinates from inline styles for a stable zoom
                const leftPercent = hotspot.style.left;
                const topPercent = hotspot.style.top;
                
                // Set transform origin and scale (zoom in)
                fpContainer.style.transformOrigin = `${leftPercent} ${topPercent}`;
                
                // Scale factor for fly-through feel
                fpContainer.style.transform = 'scale(4)';
                
                // Set the image src
                flythroughImage.src = imageSrc;
                
                // Fade in immersive viewer after a slight delay to allow zoom to start
                setTimeout(() => {
                    flythroughViewer.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                }, 400); // Wait for zoom to gain momentum
            });
        });

        const closeFlythrough = () => {
            flythroughViewer.classList.remove('active');
            
            // Wait for fade out then reset zoom
            setTimeout(() => {
                fpContainer.style.transform = 'scale(1)';
                document.body.style.overflow = 'auto'; // Re-enable scrolling
                
                // Clear image src after reset transition
                setTimeout(() => {
                    flythroughImage.src = '';
                }, 1200);
            }, 800); // Wait for viewer to fade out completely
        };

        if (flythroughClose) {
            flythroughClose.addEventListener('click', closeFlythrough);
        }

        // Integrate with existing Esc key handler (or add new one)
        window.addEventListener('keydown', (e) => {
            if ((e.key === 'Escape' || e.keyCode === 27) && flythroughViewer.classList.contains('active')) {
                closeFlythrough();
            }
        });
    }

});
