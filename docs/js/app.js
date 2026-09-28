/* ==========================================================================
   APP.JS — Progressive enhancement only. Every tile and every page renders
   and reads correctly with this file disabled.
   ========================================================================== */
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    /* ----------------------------------------------------------------------
       THEME
       The initial value is set by an inline snippet in <head> to avoid a
       flash; here we only handle the toggle and OS-preference changes.
       ---------------------------------------------------------------------- */
    function initTheme() {
        const toggle = $('#themeToggle');
        const os = window.matchMedia('(prefers-color-scheme: dark)');

        const apply = (theme, persist) => {
            document.documentElement.dataset.theme = theme;
            $('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0b0e' : '#eeeef1');
            if (persist) {
                try { localStorage.setItem('theme', theme); } catch { /* private mode: session-only */ }
            }
            toggle?.setAttribute('aria-label', theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre');
        };

        apply(document.documentElement.dataset.theme || 'light', false);

        toggle?.addEventListener('click', () => {
            apply(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
        });

        os.addEventListener('change', (e) => {
            let stored = null;
            try { stored = localStorage.getItem('theme'); } catch { /* ignore */ }
            if (!stored) apply(e.matches ? 'dark' : 'light', false);
        });
    }

    /* ----------------------------------------------------------------------
       TILE SPOTLIGHT — a soft glow follows the pointer across a tile.
       Fine pointers only; one delegated listener for the whole page.
       ---------------------------------------------------------------------- */
    function initSpotlight() {
        if (reduceMotion.matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        document.addEventListener('pointermove', (e) => {
            const tile = e.target.closest?.('.tile');
            if (!tile) return;
            const r = tile.getBoundingClientRect();
            tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
            tile.style.setProperty('--my', `${e.clientY - r.top}px`);
        }, { passive: true });
    }

    /* ----------------------------------------------------------------------
       CAROUSEL
       Autoplay pauses on hover, on focus, when the tab is hidden, when the
       carousel scrolls out of view, and permanently after a manual input.
       The caption mirrors the current slide's alt text.
       ---------------------------------------------------------------------- */
    function initCarousel(root) {
        const slides = $$('.carousel-slide', root);
        if (slides.length < 2) return;

        const dots = $$('.carousel-dot', root);
        const caption = $('.carousel-caption', root);
        const DELAY = 6000;

        let index = Math.max(0, slides.findIndex((s) => s.getAttribute('aria-hidden') === 'false'));
        let timer = null;
        let manual = false;
        let visible = true;

        const render = () => {
            slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== index)));
            dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
            if (caption) caption.textContent = `${index + 1} / ${slides.length} · ${$('img', slides[index])?.alt || ''}`;
        };

        const stop = () => { clearInterval(timer); timer = null; };
        const start = () => {
            stop();
            if (manual || !visible || reduceMotion.matches) return;
            timer = setInterval(() => { index = (index + 1) % slides.length; render(); }, DELAY);
        };

        const go = (next) => {
            manual = true;
            stop();
            index = (next + slides.length) % slides.length;
            render();
        };

        $('.carousel-arrow.prev', root)?.addEventListener('click', () => go(index - 1));
        $('.carousel-arrow.next', root)?.addEventListener('click', () => go(index + 1));
        dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        root.addEventListener('focusin', stop);
        root.addEventListener('focusout', start);

        root.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
        });

        document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            visible ? start() : stop();
        }, { threshold: 0.25 }).observe(root);

        render();
        start();
    }

    /* ----------------------------------------------------------------------
       BOOT
       ---------------------------------------------------------------------- */
    function boot() {
        initTheme();
        initSpotlight();
        $$('[data-carousel]').forEach(initCarousel);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
