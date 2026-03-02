// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    /* --- Navbar Scroll Effect --- */
    const navbar = document.getElementById('navbar');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeToggleIcon = themeToggle.querySelector('i');
    const storedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

    function getThemeValue(name) {
        return getComputedStyle(body).getPropertyValue(name).trim();
    }

    function setTheme(theme, persist = true) {
        body.dataset.theme = theme;
        if (persist) {
            localStorage.setItem('theme', theme);
        }
        const isLight = theme === 'light';
        themeToggle.setAttribute('aria-pressed', String(isLight));
        themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        themeToggleIcon.className = isLight ? 'fas fa-moon' : 'fa-regular fa-sun';

        if (window.innerWidth <= 768 && navLinks.style.display === 'flex') {
            openMobileMenu();
        }
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- Mobile Menu Toggle --- */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    function openMobileMenu() {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = getThemeValue('--nav-mobile-bg');
        navLinks.style.backdropFilter = 'blur(10px)';
        navLinks.style.padding = '2rem';
        navLinks.style.borderBottom = `1px solid ${getThemeValue('--glass-border')}`;
    }

    setTheme(storedTheme || (prefersLight.matches ? 'light' : 'dark'), Boolean(storedTheme));

    themeToggle.addEventListener('click', () => {
        setTheme(body.dataset.theme === 'light' ? 'dark' : 'light');
    });

    // Simple toggle (you could expand this with a proper sliding menu)
    hamburger.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            openMobileMenu();
        }
    });

    // Close mobile menu on click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'row';
            navLinks.style.position = 'static';
            navLinks.style.background = 'transparent';
            navLinks.style.padding = '0';
            navLinks.style.borderBottom = 'none';
        } else {
            navLinks.style.display = 'none';
        }
    });

    /* --- Scroll Animations (Intersection Observer) --- */
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    const faders = document.querySelectorAll('.appear');
    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    /* --- Interactive Canvas Particles (Quantum Theme) --- */
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let w, h, particles;

    // Mouse properties
    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function initCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        particles = [];

        // Number of particles depends on screen size
        let numParticles = Math.floor((w * h) / 15000);

        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
        }

        draw() {
            ctx.fillStyle = getThemeValue('--canvas-particle');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            // Constant slow movement
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;

            // Mouse interaction (repel)
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                // Direction of force
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;

                // Max distance, past that the force is 0
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;

                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                this.x -= directionX;
                this.y -= directionY;
            }

            this.draw();
        }
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;

                if (distance < (w / 10) * (h / 10)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(${getThemeValue('--canvas-line-rgb')}, ${opacityValue * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        connectParticles();

        requestAnimationFrame(animate);
    }

    // Initialize and resize event
    initCanvas();
    animate();

    window.addEventListener('resize', () => {
        initCanvas();
    });

    prefersLight.addEventListener('change', (event) => {
        if (!localStorage.getItem('theme')) {
            setTheme(event.matches ? 'light' : 'dark', false);
        }
    });
});
