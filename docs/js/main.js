document.addEventListener('DOMContentLoaded', () => {
    // Reveal Observer for scroll animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a small delay based on index for staggered effect
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 3D Hover & Glow Effect on Bento Items
    const bentoItems = document.querySelectorAll('.bento-item');

    bentoItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            item.style.setProperty('--mouse-x', `${x}px`);
            item.style.setProperty('--mouse-y', `${y}px`);
        });
        
        // Optional subtle tilt effect
        /*
        item.addEventListener('mouseleave', () => {
            item.style.setProperty('--mouse-x', `0px`);
            item.style.setProperty('--mouse-y', `0px`);
        });
        */
    });

    // Background Carousel Logic
    const carouselImages = [
        './assets/imgs/imgs_carousel/regiondex/regiondex_accueil.webp',
        './assets/imgs/imgs_carousel/regiondex/regiondex_card.webp',
        './assets/imgs/imgs_carousel/regiondex/regiondex_menu.webp',
        './assets/imgs/imgs_carousel/warchess/ChessWarMenu.webp',
        './assets/imgs/imgs_carousel/warchess/ChessWar_accueil.webp',
        './assets/imgs/imgs_carousel/warchess/modeHistoireChessWar.webp',
        './assets/imgs/imgs_carousel/warchess/paramettres-chesswar.webp'
    ];

    const bgCarousel = document.getElementById('bgCarousel');
    const overlay = bgCarousel.querySelector('.carousel-overlay');
    
    // Create image slides dynamically
    carouselImages.forEach((src, index) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        slide.style.backgroundImage = `url('${src}')`;
        bgCarousel.insertBefore(slide, overlay);
    });

    const slides = document.querySelectorAll('.carousel-slide');
    let currentImageIndex = 0;
    let carouselInterval;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentImageIndex = (currentImageIndex + 1) % slides.length;
        showSlide(currentImageIndex);
    }

    function prevSlide() {
        currentImageIndex = (currentImageIndex - 1 + slides.length) % slides.length;
        showSlide(currentImageIndex);
    }
    
    // Change slide every 5 seconds
    if (slides.length > 0) {
        carouselInterval = setInterval(nextSlide, 5000);

        const btnPrev = document.getElementById('carouselPrev');
        const btnNext = document.getElementById('carouselNext');

        if(btnPrev && btnNext) {
            btnNext.addEventListener('click', () => {
                clearInterval(carouselInterval);
                nextSlide();
                carouselInterval = setInterval(nextSlide, 5000);
            });
            btnPrev.addEventListener('click', () => {
                clearInterval(carouselInterval);
                prevSlide();
                carouselInterval = setInterval(nextSlide, 5000);
            });
        }
    }
    
    // Rain Generation
    const rainContainer = document.getElementById('rainContainer');
    if (rainContainer) {
        const numDrops = 100;
        for (let i = 0; i < numDrops; i++) {
            const drop = document.createElement('div');
            drop.classList.add('drop');
            drop.style.left = `${Math.random() * 100}vw`;
            drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            drop.style.opacity = Math.random() * 0.5 + 0.2;
            rainContainer.appendChild(drop);
        }
    }
});
