/**
 * Avishi & Rahul's Wedding Invitation Website - Application Script
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
    
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================
    // 0. Language Translation Engine
    // ==========================================
    let scratchCardsRevealed = false;

    // ==========================================
    // 0.1. Interactive Envelope Invitation Cover
    // ==========================================
    const envelopeOverlay = document.getElementById('envelopeOverlay');
    const envelopeWrapper = document.getElementById('envelopeWrapper');
    
    // Lock body scroll while overlay is active
    let isMainContentVisible = false;
    if (envelopeOverlay) {
        document.body.style.overflow = 'hidden';
    }
    
    if (envelopeWrapper && envelopeOverlay) {
        envelopeWrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); envelopeWrapper.click(); }
        });
        envelopeWrapper.addEventListener('click', () => {
            if (envelopeWrapper.classList.contains('open')) return;
            
            // 1. Open the 3D flap and slide card out of envelope
            envelopeWrapper.classList.add('open');
            
            // 2. Play ambient music automatically on user gesture
            if (typeof toggleMusic === 'function' && !isPlaying) {
                toggleMusic();
            }
            
            // 3. Once the card has slid out, open the invitation
            setTimeout(() => {
                proceedToMainSite();
            }, 1100);
        });
    }

    function proceedToMainSite() {
        if (!scratchCardsRevealed) initScratchCard();
        
        // Zoom/Expand the card to fill the viewport
        envelopeOverlay.classList.add('expand-active');
        
        // Remove overlay to reveal the main site (after zoom completes)
        setTimeout(() => {
            envelopeOverlay.style.display = 'none';
            document.body.style.overflow = ''; // Unlock scrolling
            playIntro();
            isMainContentVisible = true;
        }, 600); // 600ms matching transition speed
    }

    
    // (Scroll to Bottom Close Envelope Loop removed as requested)
    
    // ==========================================
    // 0.5. Interactive Scratch Card Controller (Triple Cards)
    // ==========================================
    // Scratch state lives outside initScratchCard so switching language
    // redraws the cards without stacking duplicate event listeners.
    let scratchStates = null;
    let scratchBound = false;
    let isDrawing = false;
    let activeCanvasId = null;
    let globalRevealed = false;
    let revealAllScratch = () => {};

    function initScratchCard() {
        const ids = ['scratchCanvasMonth', 'scratchCanvasDay', 'scratchCanvasYear'];
        const canvases = ids.map(id => document.getElementById(id)).filter(Boolean);
        if (canvases.length < 3) return;
        
        if (!scratchStates) {
            scratchStates = {};
            canvases.forEach(c => { scratchStates[c.id] = { canvas: c, ctx: c.getContext('2d'), hasRevealed: false }; });
        }
        const states = scratchStates;
        
        // Setup visual parameters for each canvas
        canvases.forEach(canvas => {
            if (states[canvas.id].hasRevealed) return;
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
            
            let labelText = 'SCRATCH';
            if (canvas.id === 'scratchCanvasDay') {
                labelText = 'TO';
            } else if (canvas.id === 'scratchCanvasYear') {
                labelText = 'REVEAL';
            }
            ctx.fillText(labelText, logicalWidth / 2, logicalHeight / 2);
        });
        
        function fireConfetti() {
            if (prefersReducedMotion) return;
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
            const point = (e.touches && e.touches[0]) ? e.touches[0] : e;
            const clientX = point.clientX;
            const clientY = point.clientY;
            if (typeof clientX !== 'number' || typeof clientY !== 'number') return;
            
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
                const wrap = document.getElementById('scratchCardContainer');
                if (wrap) wrap.classList.add('done');
                const scrollIndicator = document.querySelector('.scroll-indicator');
                if (scrollIndicator) scrollIndicator.style.display = 'none';
                fireConfetti();
                showVideoPopup();
            }
        }
        
        revealAllScratch = () => {
            Object.values(states).forEach(state => {
                if (state.hasRevealed) return;
                state.hasRevealed = true;
                state.canvas.classList.add('scratch-canvas-fade');
                setTimeout(() => { state.canvas.style.display = 'none'; }, 500);
            });
            checkAllRevealed();
        };

        if (scratchBound) return;
        scratchBound = true;

        // Attach event listeners to all canvases (once)
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
            }, { passive: true });
            
            canvas.addEventListener('touchmove', (e) => {
                if (isDrawing && activeCanvasId === id) {
                    e.preventDefault();
                    scratch(id, e);
                }
            }, { passive: false });
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
    

    const scratchSkip = document.getElementById('scratchSkip');
    if (scratchSkip) scratchSkip.addEventListener('click', () => revealAllScratch());

    // Video Popup Control
    function showVideoPopup() {
        const videoPopup = document.getElementById('videoPopup');
        const popupVideo = document.getElementById('popupVideo');
        const playPauseBtn = document.getElementById('videoPlayPauseBtn');
        const unmuteBtn = document.getElementById('videoUnmuteBtn');
        const fullscreenBtn = document.getElementById('videoFullscreenBtn');
        const closeBtn = document.getElementById('videoPopupClose');
        
        if (!videoPopup || !popupVideo) return;
        
        // Show container
        videoPopup.classList.add('show');
        popupVideo.preload = 'auto';
        
        // Attempt autoplay (starts UNMUTED by default to play video sound immediately)
        popupVideo.muted = false;
        const playPromise = popupVideo.play();
        if (playPromise !== undefined && typeof playPromise.catch === 'function') {
            playPromise.catch(err => {
                console.log('Video unmuted autoplay blocked, falling back to muted...', err);
                // Fallback to muted autoplay
                popupVideo.muted = true;
                popupVideo.play().catch(muteErr => {
                    console.log('Video autoplay failed entirely:', muteErr);
                });
            });
        }
        
        // Helper to bind events for both desktop and iOS Safari touch events
        function bindMediaControl(btn, callback) {
            if (!btn) return;
            
            // Listen to click
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                callback();
            });
            
            // Listen to touchstart (crucial for iOS Safari overlay compatibility)
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                callback();
            }, { passive: false });
        }
        
        // Play/Pause button functionality
        bindMediaControl(playPauseBtn, () => {
            if (popupVideo.paused) {
                popupVideo.play();
            } else {
                popupVideo.pause();
            }
        });
        
        // Sync play/pause icons with video events
        popupVideo.addEventListener('play', () => {
            if (playPauseBtn) {
                playPauseBtn.querySelector('svg').innerHTML = `
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>
                `;
            }
            // If the video starts playing and is NOT muted, pause the site music
            if (!popupVideo.muted) {
                if (isPlaying) {
                    wasMusicPlayingBeforeVideo = true;
                    isPlaying = false;
                    pauseSiteMusic();
                }
            }
        });
        popupVideo.addEventListener('pause', () => {
            if (playPauseBtn) {
                playPauseBtn.querySelector('svg').innerHTML = `
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                `;
            }
            // Auto-resume site music when video is paused
            if (wasMusicPlayingBeforeVideo) {
                isPlaying = true;
                playSiteMusic();
                wasMusicPlayingBeforeVideo = false;
            }
        });

        // Function to update the unmute button UI based on video muted state
        function updateMuteButtonUI() {
            if (!unmuteBtn) return;
            const textSpan = unmuteBtn.querySelector('span');
            if (popupVideo.muted) {
                if (textSpan) {
                    textSpan.textContent = 'Unmute';
                }
                unmuteBtn.querySelector('svg').innerHTML = `
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/>
                `;
            } else {
                if (textSpan) {
                    textSpan.textContent = 'Mute';
                }
                unmuteBtn.querySelector('svg').innerHTML = `
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
                `;
            }
        }

        // Set initial state of mute icon
        updateMuteButtonUI();

        // Unmute button functionality
        bindMediaControl(unmuteBtn, () => {
            popupVideo.muted = !popupVideo.muted;
        });

        // Listen for mute/unmute change to sync background music and UI
        popupVideo.addEventListener('volumechange', () => {
            updateMuteButtonUI();
            
            if (popupVideo.muted) {
                // If it is muted (and video is playing), auto-resume site music
                if (wasMusicPlayingBeforeVideo) {
                    isPlaying = true;
                    playSiteMusic();
                    wasMusicPlayingBeforeVideo = false;
                }
            } else {
                // If it is unmuted (and video is playing), pause site music
                if (!popupVideo.paused && isPlaying) {
                    wasMusicPlayingBeforeVideo = true;
                    isPlaying = false;
                    pauseSiteMusic();
                }
            }
        });
        
        // Fullscreen button functionality
        bindMediaControl(fullscreenBtn, () => {
            if (popupVideo.requestFullscreen) {
                popupVideo.requestFullscreen();
            } else if (popupVideo.webkitRequestFullscreen) { /* Safari / iOS */
                popupVideo.webkitRequestFullscreen();
            } else if (popupVideo.webkitEnterFullscreen) { /* Specific to iOS Safari video elements */
                popupVideo.webkitEnterFullscreen();
            } else if (popupVideo.msRequestFullscreen) { /* IE11 */
                popupVideo.msRequestFullscreen();
            }
        });
        
        // Close button functionality
        bindMediaControl(closeBtn, () => {
            popupVideo.pause();
            videoPopup.classList.remove('show');
            // Auto-resume site music when popup closed
            if (wasMusicPlayingBeforeVideo) {
                isPlaying = true;
                playSiteMusic();
                wasMusicPlayingBeforeVideo = false;
            }
        });
    }
    
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
            const cd = document.getElementById('countdown');
            const done = document.getElementById('countdownDone');
            if (cd) cd.style.display = 'none';
            if (done) done.hidden = false;
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
        
        // Padding, with a small drop-in whenever a digit changes
        const setNum = (el, n) => {
            if (!el) return;
            const v = n < 10 ? '0' + n : String(n);
            if (el.textContent === v) return;
            el.textContent = v;
            el.classList.remove('tick');
            void el.offsetWidth;
            el.classList.add('tick');
        };
        setNum(daysEl, days);
        setNum(hoursEl, hours);
        setNum(minutesEl, minutes);
        setNum(secondsEl, seconds);
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
    let wasMusicPlayingBeforeVideo = false; // Auto-resume tracker when video is playing/paused/closed
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
    
    function pauseSiteMusic() {
        if (useMp3 && bgMusic) {
            bgMusic.pause();
        } else {
            clearTimeout(synthTimer);
        }
        if (musicToggle) {
            musicToggle.classList.remove('playing');
            musicToggle.style.backgroundColor = 'var(--primary-color)';
            musicToggle.title = 'Play music';
            musicToggle.setAttribute('aria-pressed', 'false');
            musicToggle.setAttribute('aria-label', 'Play music');
        }
    }
    
    function playSiteMusic() {
        if (useMp3 && bgMusic) {
            const musicPlayPromise = bgMusic.play();
            if (musicPlayPromise !== undefined && typeof musicPlayPromise.catch === 'function') {
                musicPlayPromise.catch(err => {
                    console.log("MP3 play blocked:", err);
                    useMp3 = false;
                    startSynthesizer();
                });
            }
        } else {
            startSynthesizer();
        }
        if (musicToggle) {
            musicToggle.classList.add('playing');
            musicToggle.style.backgroundColor = 'var(--accent-gold-bright)';
            musicToggle.title = 'Pause music';
            musicToggle.setAttribute('aria-pressed', 'true');
            musicToggle.setAttribute('aria-label', 'Pause music');
        }
    }

    function toggleMusic() {
        if (isPlaying) {
            isPlaying = false;
            wasMusicPlayingBeforeVideo = false; // Reset auto-resume state if manually paused
            pauseSiteMusic();
        } else {
            isPlaying = true;
            playSiteMusic();
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
    if (canvas && !prefersReducedMotion) {
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
    // Each card carries its own calendar details in data-cal-* attributes.
    function toGoogleDate(local) {
        // local is "YYYY-MM-DDTHH:MM" in India time (UTC+05:30) -> UTC basic format
        const d = new Date(local + ':00+05:30');
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        const actions = card.querySelector('.event-actions');
        if (actions && card.dataset.calStart) {
            const cal = new URL('https://calendar.google.com/calendar/render');
            cal.searchParams.set('action', 'TEMPLATE');
            cal.searchParams.set('text', card.dataset.calTitle);
            cal.searchParams.set('dates', toGoogleDate(card.dataset.calStart) + '/' + toGoogleDate(card.dataset.calEnd));
            cal.searchParams.set('location', card.dataset.calLocation);
            const couple = document.body.dataset.couple || '';
            cal.searchParams.set('details', 'You are warmly invited to the wedding festivities of ' + couple + '. ' + window.location.href.split('#')[0]);
            cal.searchParams.set('ctz', 'Asia/Kolkata');
            const map = 'https://maps.google.com/?q=' + encodeURIComponent(card.dataset.map || card.dataset.calLocation);
            actions.innerHTML =
                '<a class="event-action solid" target="_blank" rel="noopener noreferrer" href="' + cal.toString() + '">' +
                    '<svg width="13" height="13" aria-hidden="true"><use href="#i-cal"/></svg>' +
                    '<span>Save date</span></a>' +
                '<a class="event-action" target="_blank" rel="noopener noreferrer" href="' + map + '">' +
                    '<svg width="13" height="13" aria-hidden="true"><use href="#i-pin"/></svg>' +
                    '<span>Map</span></a>';
        }

        card.addEventListener('click', function(e) {
            // Links on the back of the card should work without flipping it
            if (e.target.closest('.event-action, .event-map-btn')) {
                return;
            }
            this.classList.toggle('flipped');
        });
        card.addEventListener('keydown', function(e) {
            if ((e.key === 'Enter' || e.key === ' ') && e.target === this) {
                e.preventDefault();
                this.classList.toggle('flipped');
            }
        });
    });

    // ==========================================
    // 9b. Venue switcher (Indore / Khargone)
    // ==========================================
    const venueMap = document.getElementById('venueMap');
    const venueDirections = document.getElementById('venueDirections');
    document.querySelectorAll('.venue-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const q = tab.dataset.query;
            if (!q) return;
            const v = { embed: encodeURIComponent(tab.dataset.embed || q), link: encodeURIComponent(q).replace(/%20/g, '+') };
            document.querySelectorAll('.venue-tab').forEach(t => {
                t.classList.toggle('active', t === tab);
                t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
            });
            if (venueMap) venueMap.src = 'https://maps.google.com/maps?q=' + v.embed + '&t=&z=16&ie=UTF8&iwloc=&output=embed';
            const card = document.getElementById('venueMapCard');
            if (card) {
                card.href = 'https://maps.google.com/?q=' + v.link;
                card.querySelectorAll('[data-venue-show]').forEach(el => { el.hidden = el.dataset.venueShow !== tab.dataset.venue; });
            }
            if (venueDirections) venueDirections.href = 'https://maps.google.com/?q=' + v.link;
        });
    });

    
    // ==========================================
    // 11. Motion: intro, polaroid developing, staggered cards, hero fade
    // ==========================================

    // Split the hero names into letters so they can rise in one by one
    document.querySelectorAll('[data-split]').forEach(el => {
        const text = el.textContent.trim();
        el.setAttribute('aria-label', text);
        el.textContent = '';
        [...text].forEach((ch, i) => {
            const span = document.createElement('span');
            span.className = 'ch' + (ch === '&' ? ' amp' : '') + (ch === ' ' ? ' sp' : '');
            span.setAttribute('aria-hidden', 'true');
            span.style.setProperty('--ci', i);
            span.textContent = ch === ' ' ? ' ' : ch;
            el.appendChild(span);
        });
    });

    let introPlayed = false;
    function playIntro() {
        if (introPlayed) return;
        introPlayed = true;
        document.body.classList.add('intro-play');
    }
    // No envelope on the page (or it failed): play straight away
    if (!envelopeOverlay || getComputedStyle(envelopeOverlay).display === 'none') playIntro();

    // Polaroids develop like instant film as they come into view
    const developObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('developed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.45 });
    document.querySelectorAll('.polaroid-card').forEach(card => developObserver.observe(card));

    // Stagger event cards that share a row, so each row deals out left to right
    function indexCardRows() {
        let rowTop = null, i = 0;
        document.querySelectorAll('.events-grid-container .event-card').forEach(card => {
            const top = card.offsetTop;
            if (rowTop === null || Math.abs(top - rowTop) > 10) { rowTop = top; i = 0; }
            card.style.setProperty('--i', i++);
        });
    }
    indexCardRows();
    window.addEventListener('resize', indexCardRows);

    // Hero content drifts up and fades as you scroll past it
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !prefersReducedMotion) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const h = window.innerHeight;
                const p = Math.min(Math.max(window.scrollY / h, 0), 1);
                heroContent.style.transform = p ? `translateY(${p * -60}px)` : '';
                heroContent.style.opacity = p ? String(1 - p * 0.9) : '';
                ticking = false;
            });
        }, { passive: true });
    }
    
});
