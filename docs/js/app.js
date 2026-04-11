// Initialisation des icônes Lucide
lucide.createIcons();

// Injection intelligente de l'iframe Rytiger au clic
document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('playBtn');
    const iframe = document.getElementById('rpgFrame');

    if (playBtn && iframe) {
        playBtn.addEventListener('click', () => {
            const dataSrc = iframe.getAttribute('data-src');
            iframe.src = dataSrc;
            playBtn.style.opacity = '0';
            setTimeout(() => {
                playBtn.style.display = 'none';
                iframe.classList.add('loaded');
            }, 300);
        });
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
});
