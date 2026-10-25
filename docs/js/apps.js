/* ==========================================================================
   APPS.JS — Motion for the apps page. Progressive enhancement only: the page
   is complete and readable without it. Under reduced motion only the
   SHA-256 copy buttons and the nav highlight run.

   Scroll work happens in one rAF-throttled pass that writes CSS variables:
   --p on each [data-scene] (0 → 1 while it crosses the viewport) and
   --reel-x on each pinned [data-reel]. The CSS turns those into motion.
   ========================================================================== */
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    /* ----------------------------------------------------------------------
       SHA-256 COPY
       ---------------------------------------------------------------------- */
    function initCopy() {
        $$('[data-copy]').forEach((btn) => {
            const label = $('span', btn);
            const initial = label?.textContent;
            btn.addEventListener('click', async () => {
                let ok = false;
                try {
                    await navigator.clipboard.writeText(btn.dataset.copy);
                    ok = true;
                } catch { /* insecure context or denied: fall back to selecting the hash */ }
                if (!ok) {
                    const code = btn.parentElement && $('code', btn.parentElement);
                    if (code) window.getSelection()?.selectAllChildren(code);
                }
                if (label) {
                    label.textContent = ok ? 'Copié !' : 'Sélectionné';
                    setTimeout(() => { label.textContent = initial; }, 1800);
                }
            });
        });
    }

    /* ----------------------------------------------------------------------
       NAV — highlights the chapter in view.
       ---------------------------------------------------------------------- */
    function initNav() {
        const links = $$('.a-nav nav a[href^="#"]');
        const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
        if (!targets.length || !('IntersectionObserver' in window)) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                links.forEach((a) => a.setAttribute('aria-current', String(a.hash === `#${e.target.id}`)));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        targets.forEach((t) => io.observe(t));
    }

    /* ----------------------------------------------------------------------
       REVEAL — blocks below the fold start hidden and slide in once. Blocks
       already on screen at load are left alone, so nothing flashes.
       ---------------------------------------------------------------------- */
    function initReveal() {
        const items = $$('[data-reveal]');
        if (!items.length || !('IntersectionObserver' in window)) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                e.target.classList.remove('is-pending');
                io.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -12% 0px' });

        items.forEach((el) => {
            if (el.getBoundingClientRect().top > window.innerHeight) {
                el.classList.add('is-pending');
                io.observe(el);
            }
        });
    }

    /* ----------------------------------------------------------------------
       COUNTERS — [data-count] counts up from 0 the first time it is seen.
       The final text is already in the HTML; this only animates towards it.
       ---------------------------------------------------------------------- */
    function initCounters() {
        const items = $$('[data-count]');
        if (!items.length || !('IntersectionObserver' in window)) return;
        const fmt = new Intl.NumberFormat('fr-FR');

        const run = (el) => {
            const target = Number(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            const t0 = performance.now();
            const DURATION = 1300;
            const tick = (now) => {
                const k = clamp((now - t0) / DURATION, 0, 1);
                const eased = 1 - Math.pow(1 - k, 3);
                el.textContent = fmt.format(Math.round(target * eased)) + suffix;
                if (k < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                run(e.target);
                io.unobserve(e.target);
            });
        }, { threshold: 0.6 });
        items.forEach((el) => io.observe(el));
    }

    /* ----------------------------------------------------------------------
       SCROLL SCENES — --p for each chapter, sideways travel for the reels.
       Reels are pinned only on large screens with a fine pointer; elsewhere
       they stay native horizontal scrollers with snap points.
       ---------------------------------------------------------------------- */
    function initScenes() {
        const scenes = $$('[data-scene]');
        const pinReels = window.matchMedia('(min-width: 1000px)').matches && finePointer;
        const reels = pinReels ? $$('[data-reel]') : [];

        const measureReels = () => {
            reels.forEach((reel) => {
                const track = $('.a-reel-track', reel);
                reel.dataset.pinned = '';
                const distance = Math.max(0, track.scrollWidth - window.innerWidth);
                reel._distance = distance;
                reel.style.setProperty('--reel-h', `${distance + window.innerHeight}px`);
            });
        };

        let queued = false;
        const update = () => {
            queued = false;
            const vh = window.innerHeight;
            scenes.forEach((s) => {
                const r = s.getBoundingClientRect();
                if (r.bottom < -vh || r.top > 2 * vh) return;
                s.style.setProperty('--p', clamp((vh - r.top) / (r.height + vh), 0, 1).toFixed(4));
            });
            reels.forEach((reel) => {
                const r = reel.getBoundingClientRect();
                const x = clamp(-r.top, 0, reel._distance || 0);
                reel.style.setProperty('--reel-x', x.toFixed(1));
            });
        };
        const queue = () => {
            if (!queued) { queued = true; requestAnimationFrame(update); }
        };

        measureReels();
        update();
        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', () => { measureReels(); queue(); });
        // Screenshots change the track width as they load.
        $$('[data-reel] img').forEach((img) => img.addEventListener('load', () => { measureReels(); queue(); }, { once: true }));
    }

    /* ----------------------------------------------------------------------
       HERO POINTER — boxes and floaters lean towards the pointer.
       ---------------------------------------------------------------------- */
    function initPointer() {
        const hero = $('.a-hero');
        if (!hero || !finePointer) return;
        let frame = 0;
        hero.addEventListener('pointermove', (e) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const r = hero.getBoundingClientRect();
                hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
                hero.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
            });
        }, { passive: true });
        hero.addEventListener('pointerleave', () => {
            hero.style.setProperty('--mx', '0');
            hero.style.setProperty('--my', '0');
        });
    }

    /* ----------------------------------------------------------------------
       CONFETTI — a short burst in the app's colours when a download starts.
       Never blocks the click: the browser follows the link as usual.
       ---------------------------------------------------------------------- */
    function initConfetti() {
        $$('[data-download]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const r = btn.getBoundingClientRect();
                const cs = getComputedStyle(btn);
                const colours = ['--f-pop', '--f-a', '--f-b'].map((v) => cs.getPropertyValue(v).trim()).filter(Boolean);
                const x0 = r.left + r.width / 2;
                const y0 = r.top + r.height / 2;
                for (let i = 0; i < 26; i++) {
                    const bit = document.createElement('span');
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 80 + Math.random() * 160;
                    bit.className = 'confetti';
                    bit.style.setProperty('--c', colours[i % colours.length] || '#fff');
                    bit.style.setProperty('--x0', `${x0}px`);
                    bit.style.setProperty('--y0', `${y0}px`);
                    bit.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
                    bit.style.setProperty('--dy', `${Math.sin(angle) * dist - 60}px`);
                    bit.style.setProperty('--rot', `${Math.round(Math.random() * 720 - 360)}deg`);
                    bit.addEventListener('animationend', () => bit.remove(), { once: true });
                    document.body.appendChild(bit);
                }
            });
        });
    }

    /* ----------------------------------------------------------------------
       BOOT
       ---------------------------------------------------------------------- */
    function boot() {
        initCopy();
        initNav();
        if (reduceMotion) return;
        initReveal();
        initCounters();
        initScenes();
        initPointer();
        initConfetti();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
