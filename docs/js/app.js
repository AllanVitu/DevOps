/* ==========================================================================
   APP.JS — Progressive enhancement only. Every section of the site renders
   and reads correctly with this file disabled.
   ========================================================================== */
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    /* ----------------------------------------------------------------------
       THEME
       The initial class is set by an inline snippet in <head> to avoid a
       flash; here we only handle the toggle and OS-preference changes.
       ---------------------------------------------------------------------- */
    function initTheme() {
        const toggle = $('#themeToggle');
        const os = window.matchMedia('(prefers-color-scheme: dark)');

        const apply = (theme, persist) => {
            document.documentElement.dataset.theme = theme;
            document.querySelector('meta[name="theme-color"]')
                ?.setAttribute('content', theme === 'dark' ? '#07090f' : '#f7f7fb');
            if (persist) localStorage.setItem('theme', theme);
            toggle?.setAttribute('aria-label',
                theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre');
        };

        apply(document.documentElement.dataset.theme || 'light', false);

        toggle?.addEventListener('click', () => {
            apply(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
        });

        os.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) apply(e.matches ? 'dark' : 'light', false);
        });
    }

    /* ----------------------------------------------------------------------
       NAVBAR — scroll progress + stuck state, batched into one rAF per frame.
       ---------------------------------------------------------------------- */
    function initNav() {
        const nav = $('.nav');
        if (!nav) return;

        // scrollHeight is only re-measured on resize, never inside the scroll
        // handler, so scrolling never forces a synchronous layout.
        let limit = 0;
        const measure = () => {
            limit = document.documentElement.scrollHeight - window.innerHeight;
        };

        let ticking = false;
        const update = () => {
            ticking = false;
            const y = window.scrollY;
            nav.style.setProperty('--progress', limit > 0 ? `${(y / limit) * 100}%` : '0%');
            nav.classList.toggle('is-stuck', y > 8);
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        measure();
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => { measure(); update(); }, { passive: true });
        window.addEventListener('load', measure);
    }

    /* ----------------------------------------------------------------------
       MOBILE DRAWER — focus stays inside while open, Escape closes.
       ---------------------------------------------------------------------- */
    function initDrawer() {
        const burger = $('#navBurger');
        const drawer = $('#navDrawer');
        if (!burger || !drawer) return;

        const setOpen = (open) => {
            burger.setAttribute('aria-expanded', String(open));
            drawer.classList.toggle('is-open', open);
            drawer.toggleAttribute('inert', !open);
            document.body.style.overflow = open ? 'hidden' : '';
            if (open) $('a', drawer)?.focus();
            else burger.focus();
        };

        drawer.toggleAttribute('inert', true);
        burger.addEventListener('click', () => {
            setOpen(burger.getAttribute('aria-expanded') !== 'true');
        });
        $$('a', drawer).forEach((a) => a.addEventListener('click', () => setOpen(false)));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setOpen(false);
        });

        // A resize past the breakpoint must not leave the page scroll-locked.
        window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
            if (e.matches && burger.getAttribute('aria-expanded') === 'true') setOpen(false);
        });
    }

    /* ----------------------------------------------------------------------
       SCROLL SPY — highlights the section currently in view.
       ---------------------------------------------------------------------- */
    function initScrollSpy() {
        const links = $$('.nav-links a[href^="#"]');
        if (!links.length) return;

        const byId = new Map();
        links.forEach((a) => {
            const section = document.getElementById(a.hash.slice(1));
            if (section) byId.set(section, a);
        });
        if (!byId.size) return;

        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((a) => a.removeAttribute('aria-current'));
                byId.get(entry.target)?.setAttribute('aria-current', 'true');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        byId.forEach((_, section) => spy.observe(section));
    }

    /* ----------------------------------------------------------------------
       REVEAL ON SCROLL
       ---------------------------------------------------------------------- */
    function initReveal() {
        const targets = $$('.reveal');
        if (!targets.length) return;

        if (reduceMotion.matches) {
            targets.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

        targets.forEach((el) => io.observe(el));
    }

    /* ----------------------------------------------------------------------
       PROJECT FILTER
       ---------------------------------------------------------------------- */
    function initFilter() {
        const buttons = $$('.filter');
        const cards = $$('.card[data-tags]');
        const rows = $$('.archive-row[data-tags]');
        const archive = $('.archive');
        const count = $('#filterCount');
        const empty = $('#filterEmpty');
        if (!buttons.length || !cards.length) return;

        const apply = (filter) => {
            const show = (el) => {
                const match = filter === 'all' || el.dataset.tags.split(' ').includes(filter);
                el.hidden = !match;
                return match;
            };

            const shownCards = cards.filter(show).length;
            const shownRows = rows.filter(show).length;
            const total = shownCards + shownRows;

            buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));

            // Hide the archive heading too, otherwise it dangles over nothing.
            if (archive) archive.hidden = shownRows === 0;
            if (empty) empty.hidden = total > 0;
            if (count) {
                count.textContent = total === 0
                    ? 'aucun projet'
                    : `${total} projet${total > 1 ? 's' : ''} affiché${total > 1 ? 's' : ''}`;
            }
        };

        buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
        apply('all');
    }

    /* ----------------------------------------------------------------------
       CAROUSEL
       Autoplay pauses on hover, on focus, when the tab is hidden, when the
       carousel scrolls out of view, and permanently after a manual input.
       ---------------------------------------------------------------------- */
    function initCarousel(root) {
        const slides = $$('.carousel-slide', root);
        if (slides.length < 2) return;

        const dots = $$('.carousel-dot', root);
        const status = root.parentElement?.querySelector('.carousel-status');
        const DELAY = 6000;

        let index = slides.findIndex((s) => s.getAttribute('aria-hidden') === 'false');
        if (index < 0) index = 0;

        let timer = null;
        let manual = false;
        let visible = true;

        const render = () => {
            slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== index)));
            dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
            if (status) status.textContent = `${index + 1} / ${slides.length}`;
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

        document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : start();
        });

        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            visible ? start() : stop();
        }, { threshold: 0.25 }).observe(root);

        render();
        start();
    }

    /* ----------------------------------------------------------------------
       DEFERRED VIDEO
       <source> carries data-src, so nothing is fetched until the user asks.
       ---------------------------------------------------------------------- */
    function initVideo() {
        $$('[data-video]').forEach((frame) => {
            const video = $('video', frame);
            const button = $('.video-play', frame);
            if (!video || !button) return;

            button.addEventListener('click', () => {
                $$('source[data-src]', video).forEach((s) => {
                    s.src = s.dataset.src;
                    s.removeAttribute('data-src');
                });
                video.load();
                video.play().catch(() => { /* user can still hit the native control */ });
                video.controls = true;
                button.hidden = true;
            }, { once: true });
        });
    }

    /* ----------------------------------------------------------------------
       POINTER FLOURISHES — desktop, fine pointer, motion allowed.
       Reads are batched in rAF so a mousemove never thrashes layout.
       ---------------------------------------------------------------------- */
    function initPointerEffects() {
        if (reduceMotion.matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        $$('[data-magnetic]').forEach((el) => {
            let frame = null;
            el.addEventListener('mousemove', (e) => {
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    frame = null;
                    const r = el.getBoundingClientRect();
                    const x = (e.clientX - r.left - r.width / 2) * 0.16;
                    const y = (e.clientY - r.top - r.height / 2) * 0.16;
                    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
                });
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });

        $$('[data-tilt]').forEach((el) => {
            let frame = null;
            el.addEventListener('mousemove', (e) => {
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    frame = null;
                    const r = el.getBoundingClientRect();
                    const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
                    const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
                    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
                });
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    /* ----------------------------------------------------------------------
       BOOT
       ---------------------------------------------------------------------- */
    function boot() {
        initTheme();
        initNav();
        initDrawer();
        initScrollSpy();
        initReveal();
        initFilter();
        initVideo();
        initPointerEffects();
        $$('[data-carousel]').forEach(initCarousel);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
