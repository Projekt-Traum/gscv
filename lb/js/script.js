document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bookContainer = document.querySelector('.book-container');
    const leaves = Array.from(document.querySelectorAll('.leaf'));
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageIndicator = document.getElementById('currentPage');
    
    // State Variables
    let currentFlipped = 0;
    const totalLeaves = leaves.length;
    const transitionDuration = 800; // in milliseconds (matches CSS transition)
    let isTransitioning = false;
    
    /**
     * Updates the z-index stacking of all leaves based on their flipped state
     * and handles active clickable leaf classes.
     */
    function updateZIndexes() {
        leaves.forEach((leaf, index) => {
            // Remove active classes
            leaf.classList.remove('active-next', 'active-prev');
            
            if (index < currentFlipped) {
                // Flipped (Left side)
                leaf.style.zIndex = index + 1;
            } else {
                // Unflipped (Right side)
                leaf.style.zIndex = totalLeaves - index;
            }
        });
        
        // Define active leaves for clicking
        if (currentFlipped < totalLeaves) {
            leaves[currentFlipped].classList.add('active-next');
        }
        if (currentFlipped > 0) {
            leaves[currentFlipped - 1].classList.add('active-prev');
        }
    }
    
    /**
     * Updates navigation UI state: page indicators, disabled buttons, and book shifts
     */
    function updateUI() {
        // Update page indicator text
        if (currentPageIndicator) {
            if (currentFlipped === 0) {
                currentPageIndicator.textContent = "1";
            } else if (currentFlipped === totalLeaves) {
                currentPageIndicator.textContent = totalLeaves * 2;
            } else {
                const pageNumStart = currentFlipped * 2;
                const pageNumEnd = pageNumStart + 1;
                currentPageIndicator.textContent = `${pageNumStart}-${pageNumEnd}`;
            }
        }

        if (currentFlipped === 0) {
            bookContainer.classList.add('closed-front');
            bookContainer.classList.remove('closed-back');
        } else if (currentFlipped === totalLeaves) {
            bookContainer.classList.add('closed-back');
            bookContainer.classList.remove('closed-front');
        } else {
            bookContainer.classList.remove('closed-front', 'closed-back');
        }
        
        // Update button states
        if (prevBtn) prevBtn.disabled = (currentFlipped === 0);
        if (nextBtn) nextBtn.disabled = (currentFlipped === totalLeaves);
    }
    
    /**
     * Flips to the next spread
     */
    function flipNext() {
        if (isTransitioning || currentFlipped >= totalLeaves) return;
        
        isTransitioning = true;
        const leafToFlip = leaves[currentFlipped];
        
        // Elevate z-index during active animation to avoid clipping
        leafToFlip.style.zIndex = 100;
        
        leafToFlip.classList.add('flipped');
        currentFlipped++;
        
        updateUI();
        
        // Restore correct z-index order after transition ends
        setTimeout(() => {
            updateZIndexes();
            isTransitioning = false;
        }, transitionDuration);
    }
    
    /**
     * Flips back to the previous spread
     */
    function flipPrev() {
        if (isTransitioning || currentFlipped <= 0) return;
        
        isTransitioning = true;
        currentFlipped--;
        const leafToUnflip = leaves[currentFlipped];
        
        // Elevate z-index during active animation to avoid clipping
        leafToUnflip.style.zIndex = 100;
        
        leafToUnflip.classList.remove('flipped');
        
        updateUI();
        
        // Restore correct z-index order after transition ends
        setTimeout(() => {
            updateZIndexes();
            isTransitioning = false;
        }, transitionDuration);
    }
    
    // ==========================================================================
    // Event Listeners
    // ==========================================================================
    
    // Control Buttons
    if (nextBtn) nextBtn.addEventListener('click', flipNext);
    if (prevBtn) prevBtn.addEventListener('click', flipPrev);
    
    // Click on leaves directly
    leaves.forEach((leaf) => {
        leaf.addEventListener('click', (e) => {
            // If leaf is active next, click on front side flips it
            if (leaf.classList.contains('active-next')) {
                flipNext();
            } 
            // If leaf is active prev, click on back side unflips it
            else if (leaf.classList.contains('active-prev')) {
                flipPrev();
            }
        });
    });
    
    // Dynamic scaling logic for responsive desktop presentation
    function adjustScale() {
        const wrapper = document.querySelector('.book-scale-wrapper');
        if (!wrapper) return;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // If mobile/tablet layout (width <= 990px), reset style for normal flow
        if (windowWidth <= 990) {
            wrapper.style.transform = '';
            wrapper.style.transformOrigin = '';
            return;
        }
        
        // Base dimensions of the 16:9 desktop layout
        // Scaling matches the wallpaper so the book cover covers the frame across resolutions
        const scaleW = windowWidth / 1920;
        const scaleH = windowHeight / 1080;
        const wallpaperScale = Math.max(scaleW, scaleH);
        
        // Ensure 2-page open book + shortcuts tip fit inside viewport (with margins)
        const maxFitScale = Math.min((windowWidth - 40) / 960, (windowHeight - 40) / 660);
        const scale = Math.min(wallpaperScale, maxFitScale);
        
        // Snap coordinates to exact integer pixels to eliminate sub-pixel font raster blur
        const targetX = Math.round(windowWidth * 0.5103);
        const targetY = Math.round(windowHeight * 0.4866);
        
        wrapper.style.left = `${targetX}px`;
        wrapper.style.top = `${targetY}px`;
        wrapper.style.transform = `translate3d(-50%, -50%, 0) scale(${scale})`;
        wrapper.style.transformOrigin = 'center center';
    }
    
    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            flipNext();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            flipPrev();
        }
    });

    // Cross-window message listener (when parent window forwards key events)
    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'KEYDOWN') {
            if (e.data.key === 'ArrowRight') {
                flipNext();
            } else if (e.data.key === 'ArrowLeft') {
                flipPrev();
            }
        }
    });
    
    // Auto-focus on load
    try { window.focus(); } catch(err) {}
    
    // Register resize listener for scaling
    window.addEventListener('resize', adjustScale);
    
    // Initialize UI, Z-Indexes, and Scale
    updateZIndexes();
    updateUI();
    adjustScale();
});
