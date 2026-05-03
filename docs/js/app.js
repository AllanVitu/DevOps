document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    // ICON INIT
    // =============================================
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // =============================================
    // PAGE LOADER
    // =============================================
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => loader.classList.add('hidden'), 1200);
        setTimeout(() => { if (loader.parentNode) loader.remove(); }, 2000);
    }

    // =============================================
    // CUSTOM CURSOR (desktop only)
    // =============================================
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    if (dot && outline && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        function animateOutline() {
            outlineX += (mouseX - outlineX) * 0.12;
            outlineY += (mouseY - outlineY) * 0.12;
            outline.style.left = outlineX + 'px';
            outline.style.top = outlineY + 'px';
            requestAnimationFrame(animateOutline);
        }
        animateOutline();

        // Enlarge on interactive elements
        const interactives = document.querySelectorAll('a, button, .magnetic-btn, .tilt-card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => outline.classList.add('hover-active'));
            el.addEventListener('mouseleave', () => outline.classList.remove('hover-active'));
        });
    } else {
        if (dot) dot.style.display = 'none';
        if (outline) outline.style.display = 'none';
    }

    // =============================================
    // HAMBURGER MENU
    // =============================================
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // =============================================
    // RAIN EFFECT (40 drops — optimized)
    // =============================================
    const rainContainer = document.getElementById('rain-container');
    if (rainContainer) {
        const count = 40;
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.classList.add('rain-drop');
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animation = `rainFall ${Math.random() * 0.5 + 0.4}s linear infinite`;
            drop.style.animationDelay = Math.random() * 3 + 's';
            drop.style.opacity = Math.random() * 0.15 + 0.05;
            rainContainer.appendChild(drop);
        }
    }

    // =============================================
    // SCROLL TRACKER
    // =============================================
    const scrollTracker = document.querySelector('.scroll-tracker');
    if (scrollTracker) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            scrollTracker.style.width = (scrollTop / scrollHeight) * 100 + '%';
        }, { passive: true });
    }

    // =============================================
    // CAROUSEL LOGIC (with auto-play pause)
    // =============================================
    function initCarousel(carouselId, prevId, nextId) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.carousel-slide');
        const nextBtn = document.getElementById(nextId);
        const prevBtn = document.getElementById(prevId);
        let current = 0;
        let autoInterval = null;
        let userInteracted = false;

        function show(index) {
            slides.forEach(s => s.classList.remove('active'));
            if (slides[index]) slides[index].classList.add('active');
        }

        function next() {
            current = (current + 1) % slides.length;
            show(current);
        }

        function prev() {
            current = (current - 1 + slides.length) % slides.length;
            show(current);
        }

        function startAuto() {
            stopAuto();
            autoInterval = setInterval(next, 6000);
        }

        function stopAuto() {
            if (autoInterval) clearInterval(autoInterval);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                userInteracted = true;
                stopAuto();
                next();
                // Resume after 10s idle
                setTimeout(() => { if (userInteracted) startAuto(); }, 10000);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                userInteracted = true;
                stopAuto();
                prev();
                setTimeout(() => { if (userInteracted) startAuto(); }, 10000);
            });
        }

        // Pause on hover
        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);

        startAuto();
    }

    initCarousel('forgeCarousel', 'forgePrev', 'forgeNext');
    initCarousel('rytigerCarousel', 'rytigerPrev', 'rytigerNext');
    initCarousel('regiondexCarousel', 'regionPrev', 'regionNext');

    // =============================================
    // SPOTLIGHT HOVER ON GLASS PANELS
    // =============================================
    document.querySelectorAll('.glass-panel').forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            panel.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            panel.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // =============================================
    // MAGNETIC BUTTONS
    // =============================================
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // =============================================
    // 3D TILT + AURORA CARDS
    // =============================================
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotateX = ((y - cy) / cy) * -10;
            const rotateY = ((x - cx) / cx) * 10;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });
    });

    // =============================================
    // GLITCH RANDOMIZER
    // =============================================
    const glitchTexts = document.querySelectorAll('.glitch-text');
    if (glitchTexts.length > 0) {
        setInterval(() => {
            if (Math.random() > 0.6) {
                const el = glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
                el.classList.add('is-glitching');
                setTimeout(() => el.classList.remove('is-glitching'), 100 + Math.random() * 200);
            }
        }, 4000);
    }

    // =============================================
    // SCROLL REVEAL
    // =============================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-fade').forEach(el => revealObserver.observe(el));
});
