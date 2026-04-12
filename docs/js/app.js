// Initialisation des icônes Lucide
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {

    // Super Carousel Logic for Rytiger
    const superCarousel = document.getElementById('rytigerCarousel');
    if (superCarousel) {
        const slides = superCarousel.querySelectorAll('.slide');
        const prevBtn = document.getElementById('rytigerPrev');
        const nextBtn = document.getElementById('rytigerNext');
        const indicators = document.querySelectorAll('.indicator');
        let currentIndex = 0;
        let carouselTimer;

        function goToSlide(index) {
            slides[currentIndex].classList.remove('active');
            indicators[currentIndex].classList.remove('active');
            currentIndex = (index + slides.length) % slides.length;
            slides[currentIndex].classList.add('active');
            indicators[currentIndex].classList.add('active');
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        function startTimer() {
            clearInterval(carouselTimer);
            carouselTimer = setInterval(nextSlide, 5000);
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => { prevSlide(); startTimer(); });
            nextBtn.addEventListener('click', () => { nextSlide(); startTimer(); });
            indicators.forEach(ind => {
                ind.addEventListener('click', () => {
                    goToSlide(parseInt(ind.dataset.index));
                    startTimer();
                });
            });
            startTimer();
        }
    }

    // Animation d'apparition simple au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-fade').forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
        observer.observe(el);
    });

    // Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn ? themeBtn.querySelector('.theme-icon') : null;
    
    if(themeBtn && themeIcon) {
        // Load theme from localStorage or OS preference
        if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            themeIcon.setAttribute('data-lucide', 'sun');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            themeIcon.setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
        
        themeBtn.addEventListener('click', () => {
            if (document.documentElement.classList.contains('light')) {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.setAttribute('data-lucide', 'sun');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.setItem('theme', 'light');
                themeIcon.setAttribute('data-lucide', 'moon');
            }
            lucide.createIcons();
        });
    }

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
});
