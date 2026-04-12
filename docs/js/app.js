document.addEventListener('DOMContentLoaded', () => {
    // 0. Safety Check & Icon Init
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 1. Theme Toggle Logic (TOP PRIORITY)
    const themeBtn = document.getElementById('theme-toggle');
    const themeEmoji = document.getElementById('theme-emoji');
    
    function updateThemeUI(isDark) {
        console.log("Updating theme UI. isDark:", isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            if (themeEmoji) themeEmoji.textContent = '🌙'; 
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            if (themeEmoji) themeEmoji.textContent = '☀️'; 
            localStorage.setItem('theme', 'light');
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    if(themeBtn) {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialIsDark = savedTheme === 'dark' || (!savedTheme && prefersDark) || (!savedTheme && !prefersDark && document.documentElement.classList.contains('dark'));
        
        updateThemeUI(initialIsDark);
        
        themeBtn.onclick = (e) => {
            const isCurrentlyDark = document.documentElement.classList.contains('dark');
            updateThemeUI(!isCurrentlyDark);
        };
    }

    // 2. Super Carousel Logic for Rytiger
    const superCarousel = document.getElementById('rytigerCarousel');

    // Contact form Logic
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i data-lucide="loader-2" style="animation: spin 1s linear infinite;"></i> Envoi en cours...';
            lucide.createIcons();
            
            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch(contactForm.getAttribute('action'), {
                    method: 'POST',
                    body: formData
                });
                
                if(response.ok) {
                    btn.innerHTML = '<i data-lucide="check"></i> Message envoyé !';
                    btn.style.background = 'var(--emerald-500)';
                    btn.style.color = 'white';
                    lucide.createIcons();
                    contactForm.reset();
                } else {
                    throw new Error('Server error');
                }
            } catch(error) {
                btn.innerHTML = '<i data-lucide="alert-circle"></i> Erreur lors de l\'envoi';
                btn.style.background = 'var(--crimson-500)';
                btn.style.color = 'white';
                lucide.createIcons();
            }
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
                lucide.createIcons();
            }, 4000);
        });
    }
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
});


