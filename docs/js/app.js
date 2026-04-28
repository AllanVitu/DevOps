document.addEventListener('DOMContentLoaded', () => {
    // 0. Safety Check & Icon Init
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 1. Theme Logic (Forced Dark Mode)
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');

    function createRain() {
        const container = document.getElementById('rain-container');
        if (!container) return;
        container.innerHTML = '';
        const count = 100; // More drops for density behind glass
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.classList.add('rain-drop');
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animation = `fall ${Math.random() * 0.4 + 0.3}s linear infinite`;
            drop.style.animationDelay = Math.random() * 2 + 's';
            drop.style.opacity = Math.random() * 0.2 + 0.1;
            container.appendChild(drop);
        }
    }
    createRain();

    // 2. Carousel Logic for Projects
    function initCarousel(carouselId, prevBtnId, nextBtnId) {
        const carousel = document.getElementById(carouselId);
        if (carousel) {
            const slides = carousel.querySelectorAll('.carousel-slide');
            const nextBtn = document.getElementById(nextBtnId);
            const prevBtn = document.getElementById(prevBtnId);
            let currentSlide = 0;

            function showSlide(index) {
                slides.forEach(s => s.classList.remove('active'));
                if (slides[index]) slides[index].classList.add('active');
            }

            if (nextBtn) {
                nextBtn.onclick = () => {
                    currentSlide = (currentSlide + 1) % slides.length;
                    showSlide(currentSlide);
                };
            }
            if (prevBtn) {
                prevBtn.onclick = () => {
                    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                    showSlide(currentSlide);
                };
            }

            // Auto play every 6s
            setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }, 6000);
        }
    }

    initCarousel('forgeCarousel', 'forgePrev', 'forgeNext');
    initCarousel('rytigerCarousel', 'rytigerPrev', 'rytigerNext');
    initCarousel('regiondexCarousel', 'regionPrev', 'regionNext');

    // Scroll Tracker Logic
    const scrollTracker = document.querySelector('.scroll-tracker');
    if (scrollTracker) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            scrollTracker.style.width = scrollPercent + '%';
        });
    }

    // Spotlight Hover Effect
    const glassPanels = document.querySelectorAll('.glass-panel');
    glassPanels.forEach(panel => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Magnetic Buttons
    const magnetics = document.querySelectorAll('.magnetic-btn');
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const h = rect.width / 2;
            const v = rect.height / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - v;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0)`;
        });
    });

    // Glitch Randomizer
    const glitchTexts = document.querySelectorAll('.glitch-text');
    setInterval(() => {
        if (glitchTexts.length > 0 && Math.random() > 0.6) {
            const randomEl = glitchTexts[Math.floor(Math.random() * glitchTexts.length)];
            randomEl.classList.add('is-glitching');
            setTimeout(() => {
                randomEl.classList.remove('is-glitching');
            }, 100 + Math.random() * 200);
        }
    }, 4000);

    // Network Particles Canvas
    const canvas = document.getElementById('networkCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: -1000, y: -1000 };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
             mouse.x = -1000; mouse.y = -1000;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
                
                // Repel from mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    this.x -= dx * 0.05;
                    this.y -= dy * 0.05;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = document.documentElement.classList.contains('dark') ? 'rgba(16, 185, 129, 0.5)' : 'rgba(99, 102, 241, 0.4)';
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const numParticles = Math.floor((width * height) / 15000);
            for (let i = 0; i < numParticles; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = document.documentElement.classList.contains('dark') 
                            ? `rgba(16, 185, 129, ${0.15 - dist/800})`
                            : `rgba(99, 102, 241, ${0.1 - dist/1200})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }

        resize();
        animate();
    }

    // =============================================
    // =============================================
    // 🤩 3D TILT + 🌀 AURORA (combined on .tilt-card / .aurora-card)
    // =============================================
    const tiltCards = document.querySelectorAll('.tilt-card, .aurora-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;

            // Tilt angles — max ±12deg
            const rotateX = ((y - cy) / cy) * -12;
            const rotateY = ((x - cx) / cx) * 12;

            card.style.transform = `
                perspective(800px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(1.03, 1.03, 1.03)
            `;

            // Aurora spotlight tracking
            const pctX = (x / rect.width) * 100;
            const pctY = (y / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${pctX}%`);
            card.style.setProperty('--mouse-y', `${pctY}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });
    });
    // Lighthouse Animation
    const lighthouseScores = document.querySelectorAll('.lighthouse-score');
    if (lighthouseScores.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    let count = 0;
                    const duration = 1500; // ms
                    const targetValue = 100;
                    const stepTime = Math.abs(Math.floor(duration / targetValue));
                    
                    const timer = setInterval(() => {
                        count++;
                        target.textContent = count;
                        if (count >= targetValue) {
                            clearInterval(timer);
                            target.textContent = targetValue;
                        }
                    }, stepTime);
                    
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        lighthouseScores.forEach(score => observer.observe(score));
    }

    // Reveal on Scroll
    const revealElements = document.querySelectorAll('.reveal-fade');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
});


