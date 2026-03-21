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

            // Send to FormSubmit via AJAX so we don't leave the page
            fetch("https://formsubmit.co/ajax/130kathleenroad@gmail.com", {
                method: "POST",
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;

                    if (data.success === 'true' || data.success) {
                        // Hide form, show success
                        bookingForm.reset();
                        formSuccess.classList.add('active');

                        // Reset success message after 5 seconds
                        setTimeout(() => {
                            formSuccess.classList.remove('active');
                        }, 5000);
                    } else {
                        console.error('FormSubmit Error:', data);
                        alert('Oops! There was a problem submitting your form. If this is the first time using this email, please check your inbox for an activation email from FormSubmit and confirm it.');
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

});
