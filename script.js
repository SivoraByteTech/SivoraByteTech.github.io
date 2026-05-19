// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Sleek Preloader Sequence
    const preloaderProgress = document.querySelector('.preloader-progress');
    const preloaderCounter = document.querySelector('.preloader-counter');
    const preloader = document.querySelector('.preloader');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 100) progress = 100;
        
        preloaderProgress.style.width = `${progress}%`;
        preloaderCounter.textContent = `${progress}%`;
        
        if (progress === 100) {
            clearInterval(interval);
            // Animate preloader out
            gsap.to(preloader, {
                yPercent: -100,
                duration: 1,
                ease: "power4.inOut",
                delay: 0.5,
                onComplete: () => {
                    initHeroAnimations();
                }
            });
        }
    }, 50);

    // 2. Lenis Smooth Scrolling (Inertia Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easing
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Hook Lenis into GSAP ScrollTrigger
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 3. Ultra-Smooth Custom Cursor & Magnetic Buttons
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (window.matchMedia("(pointer: fine)").matches) {
        
        // GSAP quickTo is specifically built for zero-lag mouse tracking
        let xToDot = gsap.quickTo(cursorDot, "x", {duration: 0.05, ease: "none"});
        let yToDot = gsap.quickTo(cursorDot, "y", {duration: 0.05, ease: "none"});
        
        // The outline has a slightly longer duration to create a smooth "trailing" effect
        let xToOutline = gsap.quickTo(cursorOutline, "x", {duration: 0.4, ease: "power3.out"});
        let yToOutline = gsap.quickTo(cursorOutline, "y", {duration: 0.4, ease: "power3.out"});

        window.addEventListener('mousemove', (e) => {
            xToDot(e.clientX);
            yToDot(e.clientY);
            xToOutline(e.clientX);
            yToOutline(e.clientY);
        });

        // Magnetic Button Logic Integration
        const magneticWraps = document.querySelectorAll('.magnetic-wrap');
        
        magneticWraps.forEach(wrap => {
            const btn = wrap.querySelector('.magnetic-btn');
            
            wrap.addEventListener('mousemove', (e) => {
                const rect = wrap.getBoundingClientRect();
                const h = rect.width / 2;
                const v = rect.height / 2;
                
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - v;
                
                // Pull the button
                gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.4, ease: "power2.out" });
                
                // Expand cursor and fill it
                cursorOutline.style.width = '70px';
                cursorOutline.style.height = '70px';
                cursorOutline.style.margin = '-35px 0 0 -35px';
                cursorOutline.style.backgroundColor = '#fff';
                cursorDot.style.opacity = '0'; // Hide the inner dot when hovering
            });

            wrap.addEventListener('mouseleave', () => {
                // Snap button back
                gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
                
                // Reset cursor
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.margin = '-20px 0 0 -20px';
                cursorOutline.style.backgroundColor = 'transparent';
                cursorDot.style.opacity = '1';
            });
        });
    }

    // 4. Hero Reveal Animations (Runs after Preloader)
    function initHeroAnimations() {
        gsap.fromTo(".hero-title", 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" }
        );
        gsap.fromTo(".hero-desc", 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" }
        );
        gsap.fromTo(".badge", 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, delay: 0.5, ease: "back.out(1.7)" }
        );
        gsap.fromTo(".hero-actions", 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, delay: 0.6, ease: "power3.out" }
        );
    }

    // 5. GSAP ScrollTrigger Reveals for rest of page
    const revealElements = document.querySelectorAll('.gs-reveal');
    revealElements.forEach((el) => {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // Trigger when element is 85% down the viewport
                    toggleActions: "play none none reverse" // Animates in, and reverses if scrolled back up
                }
            }
        );
    });

    // 6. Interactive Canvas Particle Background (Tech Constellation)
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    
    // Mouse tracking for canvas
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
        }
        draw() {
            ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
        update() {
            // Push particles away from mouse
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 10; // return speed
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 10;
                }
            }
        }
    }

    function initParticles() {
        particles = [];
        let numberOfParticles = (width * height) / 9000; // Adjust density based on screen size
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // Draw lines connecting nearby particles
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) { // Connection distance
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 229, 255, ${1 - distance/100})`; // Fade line out over distance
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    // 7. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });
});
