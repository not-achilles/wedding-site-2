/**
 * Rahul & Avishi's Wedding Invitation Website - Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Force scroll restoration to top on page refresh/reload
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    window.addEventListener('load', () => {
        window.scrollTo(0, 0);
    });
    
    // Automatic fallback for local testing if logo file is not copied to images/ logo yet
    const isLocal = window.location.protocol === 'file:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
        const cacheLogoPath = 'file:///C:/Users/anmol/.gemini/antigravity/brain/c78c7729-ecdd-493e-a8a0-71f7665c4eed/media__1783946193874.jpg';
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function handleImgError() {
                if (this.src.includes('logo.png')) {
                    this.src = cacheLogoPath;
                    this.removeEventListener('error', handleImgError);
                }
            });
            if (img.complete && img.naturalWidth === 0 && img.src.includes('logo.png')) {
                img.src = cacheLogoPath;
            }
        });
    }
    
    // ==========================================
    // 0. Interactive Envelope Invitation Cover
    // ==========================================
    const envelopeOverlay = document.getElementById('envelopeOverlay');
    const envelopeWrapper = document.getElementById('envelopeWrapper');
    
    // Lock body scroll while overlay is active
    if (envelopeOverlay) {
        document.body.style.overflow = 'hidden';
    }
    
    if (envelopeWrapper && envelopeOverlay) {
        envelopeWrapper.addEventListener('click', () => {
            if (envelopeWrapper.classList.contains('open')) return;
            
            // 1. Open the 3D flap and slide card out of envelope
            envelopeWrapper.classList.add('open');
            
            // 2. Play ambient music automatically on user gesture
            if (typeof toggleMusic === 'function' && !isPlaying) {
                toggleMusic();
            }
            
            // 3. Zoom/Expand the card to fill the viewport (at 1.1s, immediately after card slides up)
            setTimeout(() => {
                envelopeOverlay.classList.add('expand-active');
            }, 1100);
            
            // 4. Instantly remove overlay to reveal the main site (at 1.5s, when card reaches 100% size)
            setTimeout(() => {
                envelopeOverlay.style.display = 'none';
                document.body.style.overflow = ''; // Unlock scrolling
            }, 1500);
        });
    }
    
    // ==========================================
    // 0.5. Interactive Scratch Card Controller (Triple Cards)
    // ==========================================
    function initScratchCard() {
        const ids = ['scratchCanvasMonth', 'scratchCanvasDay', 'scratchCanvasYear'];
        const canvases = ids.map(id => document.getElementById(id)).filter(Boolean);
        if (canvases.length < 3) return;
        
        const states = {
            scratchCanvasMonth: { canvas: canvases[0], ctx: canvases[0].getContext('2d'), hasRevealed: false },
            scratchCanvasDay: { canvas: canvases[1], ctx: canvases[1].getContext('2d'), hasRevealed: false },
            scratchCanvasYear: { canvas: canvases[2], ctx: canvases[2].getContext('2d'), hasRevealed: false }
        };
        
        let isDrawing = false;
        let activeCanvasId = null;
        let globalRevealed = false;
        
        // Setup visual parameters for each canvas
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            
            // Crimson Red background matching primary color theme
            ctx.fillStyle = '#9B2C39';
            
            // Round rect helper
            function drawRoundedRect(c, x, y, w, h, r) {
                c.beginPath();
                c.moveTo(x + r, y);
                c.lineTo(x + w - r, y);
                c.quadraticCurveTo(x + w, y, x + w, y + r);
                c.lineTo(x + w, y + h - r);
                c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                c.lineTo(x + r, y + h);
                c.quadraticCurveTo(x, y + h, x, y + h - r);
                c.lineTo(x, y + r);
                c.quadraticCurveTo(x, y, x + r, y);
                c.closePath();
                c.fill();
            }
            
            function drawRoundedRectStroke(c, x, y, w, h, r) {
                c.beginPath();
                c.moveTo(x + r, y);
                c.lineTo(x + w - r, y);
                c.quadraticCurveTo(x + w, y, x + w, y + r);
                c.lineTo(x + w, y + h - r);
                c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                c.lineTo(x + r, y + h);
                c.quadraticCurveTo(x, y + h, x, y + h - r);
                c.lineTo(x, y + r);
                c.quadraticCurveTo(x, y, x + r, y);
                c.closePath();
                c.stroke();
            }
            
            drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 8);
            
            // Gold pattern
            const step = 14;
            ctx.strokeStyle = 'rgba(197, 168, 128, 0.28)';
            ctx.lineWidth = 0.8;
            for (let i = -canvas.height; i < canvas.width; i += step) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + canvas.height, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.width + canvas.height; i += step) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i - canvas.height, canvas.height);
                ctx.stroke();
            }
            
            // Double gold borders
            ctx.strokeStyle = '#c5a880';
            ctx.lineWidth = 1;
            drawRoundedRectStroke(ctx, 4, 4, canvas.width - 8, canvas.height - 8, 6);
            
            ctx.strokeStyle = 'rgba(197, 168, 128, 0.6)';
            ctx.lineWidth = 0.8;
            ctx.setLineDash([2, 3]);
            drawRoundedRectStroke(ctx, 7, 7, canvas.width - 14, canvas.height - 14, 5);
            ctx.setLineDash([]);
            
            // Gold banner to hold scratch text
            ctx.fillStyle = '#c5a880';
            drawRoundedRect(ctx, canvas.width / 2 - 38, canvas.height / 2 - 12, 76, 24, 4);
            
            ctx.strokeStyle = '#fffdf9';
            ctx.lineWidth = 0.5;
            drawRoundedRectStroke(ctx, canvas.width / 2 - 36, canvas.height / 2 - 10, 72, 20, 3);
            
            ctx.fillStyle = '#9B2C39';
            ctx.font = '600 7px Montserrat, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SCRATCH', canvas.width / 2, canvas.height / 2);
        });
        
        function fireConfetti() {
            const confettiCanvas = document.createElement('canvas');
            confettiCanvas.style.position = 'fixed';
            confettiCanvas.style.top = '0';
            confettiCanvas.style.left = '0';
            confettiCanvas.style.width = '100vw';
            confettiCanvas.style.height = '100vh';
            confettiCanvas.style.pointerEvents = 'none';
            confettiCanvas.style.zIndex = '1009';
            document.body.appendChild(confettiCanvas);
            
            const cCtx = confettiCanvas.getContext('2d');
            const w = confettiCanvas.width = window.innerWidth;
            const h = confettiCanvas.height = window.innerHeight;
            
            const colors = ['#FFD700', '#D4AF37', '#B76E79', '#FADADD', '#9B2C39', '#E6C280', '#FFFFFF'];
            const particles = [];
            const startX = w / 2;
            const scratchContainer = document.getElementById('scratchCardContainer');
            let startY = h * 0.45;
            if (scratchContainer) {
                const sRect = scratchContainer.getBoundingClientRect();
                startY = sRect.top + sRect.height / 2;
            }
            
            const isMobile = window.innerWidth < 768;
            const numParticles = isMobile ? 45 : 90;
            
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: startX,
                    y: startY,
                    vx: -3.5 + Math.random() * 7,
                    vy: -6 - Math.random() * 8,
                    g: 0.2 + Math.random() * 0.15,
                    w: isMobile ? (8 + Math.random() * 6) : (12 + Math.random() * 10),
                    h: isMobile ? (10 + Math.random() * 8) : (16 + Math.random() * 14),
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                    rotationSpeed: -2 + Math.random() * 4,
                    opacity: 1
                });
            }
            
            function loop() {
                cCtx.clearRect(0, 0, w, h);
                let active = false;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    if (p.opacity <= 0) continue;
                    
                    active = true;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.g;
                    p.rotation += p.rotationSpeed;
                    p.opacity -= 0.012;
                    
                    if (p.opacity > 0) {
                        cCtx.save();
                        cCtx.translate(p.x, p.y);
                        cCtx.rotate(p.rotation * Math.PI / 180);
                        cCtx.fillStyle = p.color;
                        cCtx.globalAlpha = p.opacity;
                        cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                        cCtx.restore();
                    }
                }
                if (active) {
                    requestAnimationFrame(loop);
                } else {
                    confettiCanvas.remove();
                }
            }
            loop();
        }
        
        function scratch(canvasId, e) {
            const state = states[canvasId];
            if (!state || state.hasRevealed) return;
            
            const rect = state.canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            if (!clientX || !clientY) return;
            
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            
            state.ctx.globalCompositeOperation = 'destination-out';
            state.ctx.beginPath();
            state.ctx.arc(x, y, 16, 0, Math.PI * 2);
            state.ctx.fill();
        }
        
        function checkScratchPercentage(canvasId) {
            const state = states[canvasId];
            if (!state || state.hasRevealed) return;
            
            try {
                const imgData = state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height);
                const pixels = imgData.data;
                let cleared = 0;
                for (let i = 3; i < pixels.length; i += 4) {
                    if (pixels[i] === 0) cleared++;
                }
                const percentage = cleared / (pixels.length / 4);
                if (percentage >= 0.35) {
                    state.hasRevealed = true;
                    state.canvas.classList.add('scratch-canvas-fade');
                    
                    setTimeout(() => {
                        state.canvas.style.display = 'none';
                    }, 500);
                    
                    checkAllRevealed();
                }
            } catch (err) {
                // Fail-safe logic
                state.hasRevealed = true;
                state.canvas.classList.add('scratch-canvas-fade');
                setTimeout(() => {
                    state.canvas.style.display = 'none';
                }, 500);
                checkAllRevealed();
            }
        }
        
        function checkAllRevealed() {
            if (globalRevealed) return;
            const allDone = Object.values(states).every(s => s.hasRevealed);
            if (allDone) {
                globalRevealed = true;
                document.getElementById('heroRevealWrapper').classList.add('revealed');
                const scrollIndicator = document.querySelector('.scroll-indicator');
                if (scrollIndicator) scrollIndicator.style.display = 'none';
                fireConfetti();
            }
        }
        
        // Attach event listeners to all canvases
        canvases.forEach(canvas => {
            const id = canvas.id;
            
            canvas.addEventListener('mousedown', (e) => { 
                isDrawing = true; 
                activeCanvasId = id; 
                scratch(id, e); 
            });
            
            canvas.addEventListener('mousemove', (e) => { 
                if (isDrawing && activeCanvasId === id) {
                    scratch(id, e); 
                }
            });
            
            canvas.addEventListener('touchstart', (e) => { 
                isDrawing = true; 
                activeCanvasId = id; 
                scratch(id, e); 
            });
            
            canvas.addEventListener('touchmove', (e) => {
                if (isDrawing && activeCanvasId === id) {
                    e.preventDefault();
                    scratch(id, e);
                }
            });
        });
        
        window.addEventListener('mouseup', () => { 
            if (isDrawing && activeCanvasId) { 
                isDrawing = false; 
                checkScratchPercentage(activeCanvasId); 
                activeCanvasId = null; 
            } 
        });
        
        window.addEventListener('touchend', () => { 
            if (isDrawing && activeCanvasId) { 
                isDrawing = false; 
                checkScratchPercentage(activeCanvasId); 
                activeCanvasId = null; 
            } 
        });
    }
    
    // Initialize Scratch Card
    initScratchCard();

    // 1. Countdown Timer (Target: Nov 24, 2026 19:00:00)
    // ==========================================
    const weddingDate = new Date('Nov 24, 2026 19:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = weddingDate - now;
        
        // Elements
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (difference < 0) {
            // Marriage day has arrived or passed
            if (daysEl) daysEl.innerText = '00';
            if (hoursEl) hoursEl.innerText = '00';
            if (minutesEl) minutesEl.innerText = '00';
            if (secondsEl) secondsEl.innerText = '00';
            return;
        }
        
        // Calculations
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Padding
        if (daysEl) daysEl.innerText = days < 10 ? '0' + days : days;
        if (hoursEl) hoursEl.innerText = hours < 10 ? '0' + hours : hours;
        if (minutesEl) minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
        if (secondsEl) secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
    }
    
    // Initial run and repeat every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ==========================================
    // 2. Scroll Animation (IntersectionObserver)
    // ==========================================
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Unobserve once visible
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before entering viewport
    });
    
    fadeElements.forEach(el => fadeObserver.observe(el));



    // ==========================================
    // 6. Ambient Romantic Melody Synthesizer
    // ==========================================
    const musicToggle = document.getElementById('musicToggle');
    let audioCtx = null;
    let isPlaying = false;
    let synthTimer = null;
    
    // Jashn-E-Bahaaraa melody sequence
    // Each note: [frequency, duration_in_steps, wait_duration_in_steps]
    // 1 step = 260ms (tempo ~115 BPM)
    const melody = [
        // Kehne ko jashn-e-bahara hai
        [261.63, 1, 1],  // C4 (Keh-)
        [349.23, 1, 1],  // F4 (ne)
        [392.00, 1, 1],  // G4 (ko)
        [415.30, 2, 2],  // Ab4 (jashn-)
        [392.00, 1, 1],  // G4 (e-)
        [349.23, 1, 1],  // F4 (ba-)
        [329.63, 2, 2],  // E4 (haa-)
        [349.23, 2, 2],  // F4 (ra)
        [392.00, 3, 4],  // G4 (hai...)
        
        [0, 1, 1],       // Rest
        
        [261.63, 1, 1],  // C4 (Keh-)
        [349.23, 1, 1],  // F4 (ne)
        [392.00, 1, 1],  // G4 (ko)
        [415.30, 2, 2],  // Ab4 (jashn-)
        [392.00, 1, 1],  // G4 (e-)
        [349.23, 1, 1],  // F4 (ba-)
        [329.63, 2, 2],  // E4 (haa-)
        [349.23, 4, 6],  // F4 (ra hai)
        
        [0, 1, 2],       // Rest
        
        // Ishq yeh dekhke hairaan hai
        [261.63, 1, 1],  // C4 (Ishq)
        [415.30, 1, 1],  // Ab4 (yeh)
        [466.16, 1, 1],  // Bb4 (dekh-)
        [523.25, 2, 2],  // C5 (ke)
        [466.16, 1, 1],  // Bb4 (hai-)
        [415.30, 1, 1],  // Ab4 (raan)
        [392.00, 2, 2],  // G4 (hai...)
        [415.30, 4, 5],  // Ab4
        
        [0, 1, 1],       // Rest
        
        // Ke kehne ko jashn-e-bahara hai
        [261.63, 1, 1],  // C4 (Ke-)
        [349.23, 1, 1],  // F4 (ne)
        [392.00, 1, 1],  // G4 (ko)
        [415.30, 2, 2],  // Ab4 (jashn-)
        [392.00, 1, 1],  // G4 (e-)
        [349.23, 1, 1],  // F4 (ba-)
        [329.63, 2, 2],  // E4 (haa-)
        [349.23, 6, 8]   // F4 (ra hai...)
    ];
    
    let melodyIndex = 0;
    let useMp3 = true;
    
    // Fetch HTML5 Audio element from DOM
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.volume = 0.35; // Gentle background volume
    }
    
    function playNote(freq, time, duration) {
        if (!audioCtx) return;
        
        // Fundamental Warm Triangle Wave (Acoustic base)
        const osc1 = audioCtx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, time);
        
        // Second Harmonic Sine Wave (adds plucky sitar/plucked acoustic character)
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, time);
        
        const gain1 = audioCtx.createGain();
        const gain2 = audioCtx.createGain();
        const mainGain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(filter);
        gain2.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(audioCtx.destination);
        
        // Gains mix: 75% warm triangle + 25% sine pluck
        gain1.gain.setValueAtTime(0.04, time);
        gain2.gain.setValueAtTime(0.012, time);
        
        // Soft lowpass filter to remove harsh overtones
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, time);
        
        // Pluck volume envelope
        mainGain.gain.setValueAtTime(0, time);
        mainGain.gain.linearRampToValueAtTime(1.0, time + 0.04);
        mainGain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.02);
        
        osc1.start(time);
        osc1.stop(time + duration);
        osc2.start(time);
        osc2.stop(time + duration);
    }
    
    function playNextMelodyStep() {
        if (!isPlaying || useMp3 || !audioCtx) return;
        
        const stepTime = 260; // ms per step (tempo ~115 BPM)
        const note = melody[melodyIndex];
        const freq = note[0];
        const durationSteps = note[1];
        const waitSteps = note[2];
        
        if (freq > 0) {
            const now = audioCtx.currentTime;
            playNote(freq, now, (durationSteps * stepTime) / 1000);
        }
        
        melodyIndex = (melodyIndex + 1) % melody.length;
        
        synthTimer = setTimeout(playNextMelodyStep, waitSteps * stepTime);
    }
    
    function startSynthesizer() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        melodyIndex = 0;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        playNextMelodyStep();
    }
    
    function toggleMusic() {
        if (isPlaying) {
            isPlaying = false;
            if (useMp3) {
                bgMusic.pause();
            } else {
                clearTimeout(synthTimer);
            }
            musicToggle.classList.remove('playing');
            musicToggle.style.backgroundColor = 'var(--primary-color)';
            musicToggle.title = 'Play romantic melody';
        } else {
            isPlaying = true;
            
            // Try playing the MP3 file first
            if (useMp3) {
                bgMusic.play().catch(err => {
                    console.log("MP3 autoplay blocked or file missing. Falling back to Synthesizer.", err);
                    useMp3 = false;
                    startSynthesizer();
                });
            } else {
                startSynthesizer();
            }
            
            musicToggle.classList.add('playing');
            musicToggle.style.backgroundColor = 'var(--accent-gold-bright)';
            musicToggle.title = 'Mute music';
        }
    }
    
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }


    // ==========================================
    // 8. Canvas Falling Petals (Marigold & Rose)
    // ==========================================
    const canvas = document.getElementById('petalCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
        
        class Petal {
            constructor() {
                this.reset();
                // Randomize initial vertical position so they fall at different times at startup
                this.y = Math.random() * height;
            }
            
            reset() {
                this.x = Math.random() * width;
                this.y = -30;
                this.size = 18 + Math.random() * 12; // font size for emoji
                this.opacity = 0.6 + Math.random() * 0.4;
                this.speedY = 0.5 + Math.random() * 0.7; // fall speed
                this.speedX = -0.15 + Math.random() * 0.3; // drift speed
                this.swaySpeed = 0.008 + Math.random() * 0.012;
                this.swayOffset = Math.random() * Math.PI * 2;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = -0.01 + Math.random() * 0.02;
                
                // Emoji choices matching user's uploaded reference: pink cherry blossom, green leaf branch, purple flower
                const emojis = ['🌸', '🌿', '🪻', '🍃'];
                this.emoji = emojis[Math.floor(Math.random() * emojis.length)];
            }
            
            update() {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.swayOffset) * 0.3;
                this.swayOffset += this.swaySpeed;
                this.rotation += this.rotationSpeed;
                
                // Reset when off viewport bounds
                if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                
                ctx.font = `${this.size}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = this.opacity;
                
                ctx.fillText(this.emoji, 0, 0);
                
                ctx.restore();
            }
        }
        
        // Spawn 8 falling petals (highly sparse for a clean, minimal visual experience)
        const petals = Array.from({ length: 8 }, () => new Petal());
        
        function animate() {
            ctx.clearRect(0, 0, width, height);
            petals.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
});
