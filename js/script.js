document.addEventListener('DOMContentLoaded', async () => {

    await Promise.all([
        loadFragment('navbar', '/fragments/navbar.html'),
        loadFragment('footer', '/fragments/footer.html')
    ]);

    initializePage();
});

async function loadFragment(id, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load: ${url}`);
        const html = await response.text();
        const target = document.getElementById(id);
        if (target) target.innerHTML = html;
    } catch (error) {
        console.error(error);
    }
}

function initializePage() {

    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    let progress = 0;
    const loadInterval = setInterval(() => {
        progress += Math.random() * 18 + 4;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                preloader.classList.add('hidden');
                document.body.style.overflow = '';
                triggerHeroAnimations();
            }, 350);
        }
        fill.style.width = progress + '%';
    }, 60);
    document.body.style.overflow = 'hidden';


    /* ── NAV SCROLL ── */
    const nav = document.getElementById('mainNav');
    const onScroll = () => {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();


    /* ── MOBILE MENU ── */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileClose = document.getElementById('mobileClose');

    const openMenu = () => {
        mobileMenu.classList.add('open');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        mobileMenu.classList.remove('open');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    if (hamburger) hamburger.addEventListener('click', openMenu);
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
    document.querySelectorAll('.mm-link, .mm-cta').forEach(l => l.addEventListener('click', closeMenu));


    /* ── HERO SLIDER ── */
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('#heroDots .dot');
    let current = 0;
    let heroTimer;

    const goToSlide = (idx) => {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    };

    const startHeroTimer = () => {
        clearInterval(heroTimer);
        heroTimer = setInterval(() => goToSlide(current + 1), 5000);
    };

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goToSlide(i); startHeroTimer(); });
    });

    if (slides.length) startHeroTimer();


    /* ── HERO ANIMATIONS (fire after preloader) ── */
    const triggerHeroAnimations = () => {
        document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
            setTimeout(() => el.classList.add('revealed'), i * 140);
        });
    };


    /* ── SCROLL REVEAL ── */
    const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => {
        if (!el.closest('.hero')) revealObserver.observe(el);
    });


    /* ── BOOKING BAR — default dates + check-in/out logic ── */
    const checkin = document.getElementById('checkin');
    const checkout = document.getElementById('checkout');
    if (checkin && checkout) {
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
        const fmt = d => d.toISOString().split('T')[0];

        checkin.value = fmt(tomorrow);
        checkout.value = fmt(dayAfter);
        checkin.min = fmt(today);
        checkout.min = fmt(tomorrow);

        checkin.addEventListener('change', () => {
            const ci = new Date(checkin.value);
            const next = new Date(ci); next.setDate(ci.getDate() + 1);
            checkout.min = fmt(next);
            if (new Date(checkout.value) <= ci) checkout.value = fmt(next);
        });
    }

    const bookingBtn = document.getElementById('bookingBtn');
    if (bookingBtn) {
        bookingBtn.addEventListener('click', () => {
            bookingBtn.textContent = 'Checking…';
            bookingBtn.style.opacity = '0.7';
            setTimeout(() => {
                bookingBtn.textContent = 'Available! DM to Confirm';
                bookingBtn.style.opacity = '1';
                bookingBtn.style.background = 'var(--cafe)';
            }, 1400);
        });
    }


    /* ── GALLERY LIGHTBOX ── */
    const galleryItems = document.querySelectorAll('.gallery-item[data-src]');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbClose = document.getElementById('lbClose');
    const lbPrev = document.getElementById('lbPrev');
    const lbNext = document.getElementById('lbNext');
    const lbBackdrop = document.getElementById('lbBackdrop');
    let lbIndex = 0;
    const srcs = Array.from(galleryItems).map(el => el.dataset.src);

    const openLightbox = (idx) => {
        lbIndex = idx;
        lbImg.src = srcs[lbIndex];
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    };
    const closeLightbox = () => {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    };
    const prevImg = () => { lbIndex = (lbIndex - 1 + srcs.length) % srcs.length; lbImg.src = srcs[lbIndex]; };
    const nextImg = () => { lbIndex = (lbIndex + 1) % srcs.length; lbImg.src = srcs[lbIndex]; };

    galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
    if (lbPrev) lbPrev.addEventListener('click', prevImg);
    if (lbNext) lbNext.addEventListener('click', nextImg);
    document.addEventListener('keydown', e => {
        if (!lightbox || !lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImg();
        if (e.key === 'ArrowRight') nextImg();
    });


    /* ── TESTIMONIALS SLIDER ── */
    const track = document.getElementById('testiTrack');
    const cards = document.querySelectorAll('.testi-card');
    const dotsWrap = document.getElementById('testiDots');
    const testPrev = document.getElementById('testPrev');
    const testNext = document.getElementById('testNext');
    let testiIdx = 0;
    let perView = 3;
    let testiTimer;

    const updatePerView = () => {
        if (window.innerWidth < 768) perView = 1;
        else if (window.innerWidth < 1024) perView = 2;
        else perView = 3;
    };

    const buildDots = () => {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        const total = Math.ceil(cards.length / perView);
        for (let i = 0; i < total; i++) {
            const d = document.createElement('button');
            d.className = 'testi-dot' + (i === 0 ? ' active' : '');
            d.setAttribute('aria-label', 'Testimonial page ' + (i + 1));
            d.addEventListener('click', () => goTesti(i));
            dotsWrap.appendChild(d);
        }
    };

    const goTesti = (idx) => {
        if (!track || !cards.length) return;
        updatePerView();
        const max = Math.ceil(cards.length / perView) - 1;
        testiIdx = Math.max(0, Math.min(idx, max));
        const gap = 24;
        const cardW = cards[0] ? cards[0].offsetWidth : 0;
        track.style.transform = `translateX(-${testiIdx * (cardW + gap)}px)`;
        dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === testiIdx));
        clearInterval(testiTimer);
        testiTimer = setInterval(() => goTesti(testiIdx + 1 > Math.ceil(cards.length / perView) - 1 ? 0 : testiIdx + 1), 5000);
    };

    if (testPrev) testPrev.addEventListener('click', () => goTesti(testiIdx - 1 < 0 ? Math.ceil(cards.length / perView) - 1 : testiIdx - 1));
    if (testNext) testNext.addEventListener('click', () => goTesti(testiIdx + 1 > Math.ceil(cards.length / perView) - 1 ? 0 : testiIdx + 1));

    if (cards.length) {
        updatePerView();
        buildDots();
        testiTimer = setInterval(() => goTesti(testiIdx + 1 > Math.ceil(cards.length / perView) - 1 ? 0 : testiIdx + 1), 5000);
    }

    window.addEventListener('resize', () => {
        if (!cards.length) return;
        updatePerView();
        buildDots();
        goTesti(0);
    });


    /* ── FAQ ACCORDION ── */
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.faq-q').forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                b.nextElementSibling.style.maxHeight = null;
            });
            if (!isOpen) {
                btn.setAttribute('aria-expanded', 'true');
                const panel = btn.nextElementSibling;
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    });


    /* ── STAY TYPE SELECT — scroll to matching stay card on Check Availability ── */
    const stayTypeSelect = document.getElementById('stayTypeSelect');
    // (Optional hook for future linking between booking bar selection & stays section)


    /* ── CONTACT FORM ── */
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'Sending…';
            btn.style.opacity = '0.7';
            setTimeout(() => {
                btn.textContent = 'Send Enquiry';
                btn.style.opacity = '1';
                success.classList.add('visible');
                form.reset();
                setTimeout(() => success.classList.remove('visible'), 5000);
            }, 1500);
        });
    }


    /* ── SMOOTH SCROLL for anchor links ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (href === '#' || href === '') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const offset = (nav ? nav.offsetHeight : 80) + 8;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ── ACTIVE NAV LINK — current page ── */
    const setActivePageLink = () => {
        const navLinks = document.querySelectorAll(
            '.nav-links a, .mm-link'
        );

        if (!navLinks.length) return;

        // Get current page path
        let currentPath = window.location.pathname;

        // Remove index.html if present
        currentPath = currentPath.replace(/index\.html$/i, '');

        // Remove trailing slash except root "/"
        if (currentPath.length > 1) {
            currentPath = currentPath.replace(/\/$/, '');
        }

        // Handle empty path
        if (currentPath === '') {
            currentPath = '/';
        }

        navLinks.forEach(link => {
            const href = link.getAttribute('href');

            // Skip anchors (#book, #gallery, etc.)
            if (!href || href.startsWith('#')) return;

            let linkPath = href;

            // Ignore external links
            if (linkPath.startsWith('http')) return;

            // Remove index.html if present
            linkPath = linkPath.replace(/index\.html$/i, '');

            // Remove trailing slash except root
            if (linkPath.length > 1) {
                linkPath = linkPath.replace(/\/$/, '');
            }

            if (linkPath === '') {
                linkPath = '/';
            }

            const isActive = currentPath === linkPath;

            link.classList.toggle('active', isActive);
        });
    };

    // Run once after navbar fragment loads
    setActivePageLink();


    /* ── ACTIVE NAV LINK on scroll (in-page #id sections, e.g. homepage) ── */
    const sections = document.querySelectorAll('section[id]');
    const navAs = document.querySelectorAll('.nav-links a');
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navAs.forEach(a => {
                    const href = a.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        a.classList.toggle('active', href === '#' + entry.target.id);
                    }
                });
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => activeObserver.observe(s));


    /* ── PARALLAX on hero ── */
    const heroOverlay = document.querySelector('.hero-overlay');
    window.addEventListener('scroll', () => {
        if (heroOverlay) {
            const scrolled = window.scrollY;
            heroOverlay.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    }, { passive: true });


    /* ── COUNTER-ish reveal on hero stats (text-safe, handles km/∞/emoji) ── */
    const heroStats = document.querySelectorAll('.hero-stat strong');
    let counted = false;
    const animateStats = () => {
        if (counted) return;
        counted = true;
        heroStats.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(8px)';
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'none';
            }, i * 120);
        });
    };

    const heroSection = document.querySelector('.hero');
    const statsObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) animateStats();
    }, { threshold: 0.3 });
    if (heroSection) statsObserver.observe(heroSection);

}