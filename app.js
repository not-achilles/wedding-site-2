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
    // 0. Language Translation Engine
    // ==========================================
    let currentLang = 'en';
    let scratchCardsRevealed = false;
    
    function setLanguage(lang) {
        currentLang = lang;
        
        // 1. Update data-en / data-hi attributes
        document.querySelectorAll('[data-en], [data-hi]').forEach(el => {
            const val = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-hi');
            if (val !== null) {
                el.textContent = val;
            }
        });
        document.querySelectorAll('[data-en-html], [data-hi-html]').forEach(el => {
            const val = lang === 'en' ? el.getAttribute('data-en-html') : el.getAttribute('data-hi-html');
            if (val !== null) {
                el.innerHTML = val;
            }
        });
        
        // 2. Update toggle button label
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.textContent = lang === 'en' ? 'हि' : 'EN';
        }
        
        // 3. Re-initialize scratch card ONLY if not yet fully revealed
        if (!scratchCardsRevealed && typeof initScratchCard === 'function') {
            initScratchCard(lang);
        }
    }

    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const targetLang = currentLang === 'en' ? 'hi' : 'en';
            setLanguage(targetLang);
        });
    }

    // ==========================================
    // 0.1. Interactive Envelope Invitation Cover
    // ==========================================
    const envelopeOverlay = document.getElementById('envelopeOverlay');
    const envelopeWrapper = document.getElementById('envelopeWrapper');
    const langModal = document.getElementById('langModal');
    const btnEn = document.getElementById('btnEn');
    const btnHi = document.getElementById('btnHi');
    
    // Lock body scroll while overlay is active
    let isMainContentVisible = false;
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
            
            // 3. Show Language Selection Modal after card slides up (at 1.1s)
            setTimeout(() => {
                if (langModal) {
                    langModal.style.display = 'flex';
                    // Trigger reflow for transition
                    langModal.offsetHeight;
                    langModal.classList.add('show');
                } else {
                    // Fallback if modal is missing: proceed to zoom
                    proceedToMainSite('en');
                }
            }, 1100);
        });
    }

    function proceedToMainSite(selectedLang) {
        // Set selected language
        setLanguage(selectedLang);
        
        // Hide Modal
        if (langModal) {
            langModal.classList.remove('show');
            setTimeout(() => {
                langModal.style.display = 'none';
            }, 500);
        }
        
        // Zoom/Expand the card to fill the viewport
        envelopeOverlay.classList.add('expand-active');
        
        // Remove overlay to reveal the main site (after zoom completes)
        setTimeout(() => {
            envelopeOverlay.style.display = 'none';
            document.body.style.overflow = ''; // Unlock scrolling
            isMainContentVisible = true;
            
            // Show the floating language toggle
            if (langToggle) {
                langToggle.style.display = 'flex';
            }
        }, 600); // 600ms matching transition speed
    }

    if (btnEn) btnEn.addEventListener('click', () => proceedToMainSite('en'));
    if (btnHi) btnHi.addEventListener('click', () => proceedToMainSite('hi'));
    
    // ==========================================
    // 0.1. Scroll to Bottom Close Envelope Loop
    // ==========================================
    function triggerEnvelopeCloseLoop() {
        if (envelopeOverlay.classList.contains('closing-loop')) return;
        envelopeOverlay.classList.add('closing-loop');
        isMainContentVisible = false;
        
        // Pause music if currently playing to complete the close loop
        if (typeof toggleMusic === 'function' && isPlaying) {
            toggleMusic();
        }
        
        // 1. Instantly make the overlay visible but transparent
        envelopeOverlay.style.display = 'flex';
        envelopeOverlay.style.opacity = '0';
        envelopeOverlay.style.visibility = 'visible';
        
        // Lock body scrolling
        document.body.style.overflow = 'hidden';
        
        // 2. Start overlay fade-in, letter shrink, and flap closing simultaneously
        requestAnimationFrame(() => {
            envelopeOverlay.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
            envelopeOverlay.style.opacity = '1';
            
            // Instantly start shrinking the letter and closing the wrapper flap.
            // The custom CSS overrides (.closing-loop) ensure that:
            // - The letter slides down and shrinks instantly (0.6s, no delay)
            // - The flap waits 0.5s before rotating closed (0.5s delay)
            envelopeOverlay.classList.remove('expand-active');
            envelopeWrapper.classList.remove('open');
        });
        
        // 3. After the entire transition completes (1100ms), reset page scroll and state
        setTimeout(() => {
            // Scroll back to top under the envelope cover
            window.scrollTo(0, 0);
            
            // Clean up helper classes and transition properties
            envelopeOverlay.classList.remove('closing-loop');
            envelopeOverlay.style.transition = '';
            envelopeOverlay.style.opacity = '';
            envelopeOverlay.style.visibility = '';
        }, 1100);
    }

    // Programmatically track overscroll/downward gestures at the bottom of the page
    let bottomAttempts = 0;
    let touchStartY = 0;

    function handleGestureDown() {
        if (!isMainContentVisible) return;
        
        const scrollPosition = window.innerHeight + (window.pageYOffset || window.scrollY || document.documentElement.scrollTop);
        const scrollHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        
        // If we are at the bottom (within a threshold, say 25px)
        if (scrollPosition >= scrollHeight - 25) {
            bottomAttempts++;
            if (bottomAttempts >= 3) { // Require 3 downward scroll swipes/inputs at the bottom to trigger
                triggerEnvelopeCloseLoop();
                bottomAttempts = 0;
            }
        } else {
            bottomAttempts = 0;
        }
    }

    // Wheel event (Desktop/Trackpads)
    window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) {
            handleGestureDown();
        }
    }, { passive: true });

    // Touch events (Mobile swipe attempts)
    window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            const touchEndY = e.touches[0].clientY;
            const diffY = touchStartY - touchEndY;
            if (diffY > 15) { // Swiping up to scroll down
                handleGestureDown();
                touchStartY = touchEndY; // Update baseline to avoid triggering multiple counts per single drag
            }
        }
    }, { passive: true });
    
    // ==========================================
    // 0.5. Interactive Scratch Card Controller (Triple Cards)
    // ==========================================
    function initScratchCard(lang = 'en') {
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
            const dpr = window.devicePixelRatio || 1;
            const logicalWidth = canvas.clientWidth || canvas.width || 120;
            const logicalHeight = canvas.clientHeight || canvas.height || 120;
            
            // Set canvas buffer sizes scaled by device pixel ratio for Ultra HD
            canvas.width = logicalWidth * dpr;
            canvas.height = logicalHeight * dpr;
            ctx.scale(dpr, dpr);
            
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
            
            drawRoundedRect(ctx, 0, 0, logicalWidth, logicalHeight, 8);
            
            // Gold pattern
            const step = 14;
            ctx.strokeStyle = 'rgba(197, 168, 128, 0.28)';
            ctx.lineWidth = 0.8;
            for (let i = -logicalHeight; i < logicalWidth; i += step) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + logicalHeight, logicalHeight);
                ctx.stroke();
            }
            for (let i = 0; i < logicalWidth + logicalHeight; i += step) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i - logicalHeight, logicalHeight);
                ctx.stroke();
            }
            
            // Double gold borders
            ctx.strokeStyle = '#c5a880';
            ctx.lineWidth = 1;
            drawRoundedRectStroke(ctx, 4, 4, logicalWidth - 8, logicalHeight - 8, 6);
            
            ctx.strokeStyle = 'rgba(197, 168, 128, 0.6)';
            ctx.lineWidth = 0.8;
            ctx.setLineDash([2, 3]);
            drawRoundedRectStroke(ctx, 7, 7, logicalWidth - 14, logicalHeight - 14, 5);
            ctx.setLineDash([]);
            
            // Gold banner to hold scratch text
            ctx.fillStyle = '#c5a880';
            drawRoundedRect(ctx, logicalWidth / 2 - 38, logicalHeight / 2 - 12, 76, 24, 4);
            
            ctx.strokeStyle = '#fffdf9';
            ctx.lineWidth = 0.5;
            drawRoundedRectStroke(ctx, logicalWidth / 2 - 36, logicalHeight / 2 - 10, 72, 20, 3);
            
            ctx.fillStyle = '#9B2C39';
            ctx.font = '600 8.5px Montserrat, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            let labelText = lang === 'en' ? 'SCRATCH' : 'स्क्रैच';
            if (canvas.id === 'scratchCanvasDay') {
                labelText = lang === 'en' ? 'TO' : 'करें';
            } else if (canvas.id === 'scratchCanvasYear') {
                labelText = lang === 'en' ? 'REVEAL' : 'देखें';
            }
            ctx.fillText(labelText, logicalWidth / 2, logicalHeight / 2);
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
            
            const colors = {
                gold: ['#FFD700', '#D4AF37', '#F2CD5C', '#F7D060', '#FFFDF9'],
                crimson: ['#9B2C39', '#801A24', '#C84B5B', '#6b1019']
            };
            const types = ['foil', 'star', 'petal'];
            const particles = [];
            const activeRockets = [];
            const isMobile = window.innerWidth < 768;
            
            const scratchContainer = document.getElementById('scratchCardContainer');
            let startY = h * 0.45;
            if (scratchContainer) {
                const sRect = scratchContainer.getBoundingClientRect();
                startY = sRect.top + sRect.height / 2;
            }
            
            // Staggered rocket queue based on frames (rockets launch after immediate burst)
            const rocketQueue = [
                { delay: 15, x: w * 0.3, vx: 0.6, vy: isMobile ? -11 : -14, targetY: h * 0.35, color: '#D4AF37' },
                { delay: 28, x: w * 0.7, vx: -0.6, vy: isMobile ? -12 : -15, targetY: h * 0.3, color: '#9B2C39' },
                { delay: 50, x: w * 0.5, vx: 0, vy: isMobile ? -13 : -16, targetY: h * 0.2, color: '#F2CD5C' },
                { delay: 75, x: w * 0.22, vx: 0.9, vy: isMobile ? -10.5 : -13.5, targetY: h * 0.4, color: '#C84B5B' },
                { delay: 95, x: w * 0.78, vx: -0.9, vy: isMobile ? -10.5 : -13.5, targetY: h * 0.4, color: '#FFFDF9' }
            ];
            
            function explode(x, y, customColors) {
                const numSparks = isMobile ? 35 : 60;
                const pool = customColors || ['#FFD700', '#D4AF37', '#F2CD5C', '#9B2C39', '#C84B5B', '#FFFDF9'];
                
                // 1. Radial Spark Burst (Firework effect)
                for (let i = 0; i < numSparks; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1.5 + Math.random() * 6.5;
                    particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        g: 0.12,
                        friction: 0.96, // High friction for radial drag
                        w: 3 + Math.random() * 2.5,
                        h: 3 + Math.random() * 2.5,
                        color: pool[Math.floor(Math.random() * pool.length)],
                        type: 'spark',
                        opacity: 1,
                        fadeSpeed: 0.015 + Math.random() * 0.01
                    });
                }
                
                // 2. Confetti Ejected from Explosion (petals, gold foils, stars)
                const numConfetti = isMobile ? 12 : 24;
                const foilColors = ['#FFD700', '#D4AF37', '#F2CD5C', '#FFFDF9'];
                const crimsonColors = ['#9B2C39', '#801A24', '#C84B5B', '#6b1019'];
                
                for (let i = 0; i < numConfetti; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 4.5;
                    const type = types[Math.floor(Math.random() * types.length)];
                    let color;
                    if (type === 'petal') {
                        color = crimsonColors[Math.floor(Math.random() * crimsonColors.length)];
                    } else if (type === 'star') {
                        color = foilColors[Math.floor(Math.random() * foilColors.length)];
                    } else {
                        color = Math.random() > 0.45 ? foilColors[Math.floor(Math.random() * foilColors.length)] : crimsonColors[Math.floor(Math.random() * crimsonColors.length)];
                    }
                    
                    particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed - 2, // Upward initial launch direction
                        g: 0.15 + Math.random() * 0.08,
                        friction: 0.985,
                        w: isMobile ? (6 + Math.random() * 5) : (10 + Math.random() * 7),
                        h: isMobile ? (8 + Math.random() * 6) : (14 + Math.random() * 9),
                        color: color,
                        type: type,
                        rotation: Math.random() * 360,
                        rotationSpeed: -3.5 + Math.random() * 7,
                        opacity: 1,
                        fadeSpeed: 0.007 + Math.random() * 0.005
                    });
                }
            }
            
            let frame = 0;
            
            function loop() {
                cCtx.clearRect(0, 0, w, h);
                let active = false;
                
                // Spawn queued rockets
                for (let i = rocketQueue.length - 1; i >= 0; i--) {
                    if (frame >= rocketQueue[i].delay) {
                        const r = rocketQueue[i];
                        activeRockets.push({
                            x: r.x,
                            y: h + 15,
                            vx: r.vx,
                            vy: r.vy,
                            targetY: r.targetY,
                            color: r.color,
                            exploded: false
                        });
                        rocketQueue.splice(i, 1);
                    }
                }
                
                // Update and draw active rockets
                for (let i = activeRockets.length - 1; i >= 0; i--) {
                    const r = activeRockets[i];
                    r.x += r.vx;
                    r.y += r.vy;
                    r.vy += 0.09; // Apply subtle gravity force to rocket arc
                    
                    active = true;
                    
                    // Draw rocket trail glow
                    cCtx.save();
                    cCtx.beginPath();
                    cCtx.arc(r.x, r.y, 6, 0, Math.PI * 2);
                    cCtx.fillStyle = 'rgba(255, 215, 0, 0.22)';
                    cCtx.fill();
                    cCtx.beginPath();
                    cCtx.arc(r.x, r.y, 3, 0, Math.PI * 2);
                    cCtx.fillStyle = '#FFFDF9';
                    cCtx.fill();
                    cCtx.restore();
                    
                    // Explode if rocket reaches peak height or starts falling
                    if (r.y <= r.targetY || r.vy >= -0.5) {
                        const customColors = r.color === '#9B2C39' ? colors.crimson : (r.color === '#D4AF37' ? colors.gold : null);
                        explode(r.x, r.y, customColors);
                        activeRockets.splice(i, 1);
                    }
                }
                
                // Update and draw particles (sparks and falling confetti)
                if (particles.length > 0) {
                    active = true;
                    for (let i = particles.length - 1; i >= 0; i--) {
                        const p = particles[i];
                        if (p.opacity <= 0) {
                            particles.splice(i, 1);
                            continue;
                        }
                        
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vx *= p.friction || 1;
                        p.vy *= p.friction || 1;
                        p.vy += p.g;
                        
                        if (p.type !== 'spark') {
                            p.rotation += p.rotationSpeed;
                        }
                        p.opacity -= p.fadeSpeed || 0.01;
                        
                        if (p.opacity > 0) {
                            cCtx.save();
                            cCtx.translate(p.x, p.y);
                            
                            if (p.type === 'spark') {
                                cCtx.globalAlpha = p.opacity;
                                cCtx.fillStyle = p.color;
                                cCtx.beginPath();
                                cCtx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                                cCtx.fill();
                            } else {
                                cCtx.rotate(p.rotation * Math.PI / 180);
                                let currentOpacity = p.opacity;
                                if (p.type === 'star' || p.type === 'foil') {
                                    currentOpacity *= (0.55 + 0.45 * Math.sin(p.rotation * 0.08));
                                }
                                cCtx.globalAlpha = currentOpacity;
                                cCtx.fillStyle = p.color;
                                
                                if (p.type === 'star') {
                                    cCtx.beginPath();
                                    const size = p.w * 0.85;
                                    cCtx.moveTo(0, -size);
                                    cCtx.quadraticCurveTo(0, 0, size, 0);
                                    cCtx.quadraticCurveTo(0, 0, 0, size);
                                    cCtx.quadraticCurveTo(0, 0, -size, 0);
                                    cCtx.quadraticCurveTo(0, 0, 0, -size);
                                    cCtx.closePath();
                                    cCtx.fill();
                                } else if (p.type === 'petal') {
                                    cCtx.beginPath();
                                    const rx = p.w / 2;
                                    const ry = p.h / 2;
                                    cCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
                                    cCtx.closePath();
                                    cCtx.fill();
                                } else {
                                    cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                                }
                            }
                            cCtx.restore();
                        }
                    }
                }
                
                frame++;
                if (active || rocketQueue.length > 0) {
                    requestAnimationFrame(loop);
                } else {
                    confettiCanvas.remove();
                }
            }
            
            // Trigger 2 instant explosions at the center of the scratch cards for immediate feedback
            explode(w * 0.43, startY);
            explode(w * 0.57, startY);
            
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
                scratchCardsRevealed = true; // Set outer scope variable to prevent re-initialization
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
    
    // Initialize Scratch Card (will be initialized via setLanguage dynamically)
    // initScratchCard();

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

    // Pause music if the tab becomes hidden (minimised / locked screen)
    // Resume when it returns to focus if it was active
    let wasPlayingBeforeHide = false;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (isPlaying) {
                wasPlayingBeforeHide = true;
                toggleMusic();
            } else {
                wasPlayingBeforeHide = false;
            }
        } else {
            if (wasPlayingBeforeHide) {
                wasPlayingBeforeHide = false;
                toggleMusic();
            }
        }
    });


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
    
    // ==========================================
    // 9. Tap to Flip Ceremony Cards (Mobile Support)
    // ==========================================
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // If the user clicked the map button, don't flip the card
            if (e.target.closest('.event-map-btn')) {
                return;
            }
            this.classList.toggle('flipped');
        });
    });
    
});
