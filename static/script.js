/* ==========================================
   1. Слайдер-витрина (Главная страница)
   ========================================== */
document.querySelectorAll('.slider-wrapper').forEach((wrapper) => {
    const track = wrapper.querySelector('.slider-track');
    const prevBtn = wrapper.querySelector('.prev-btn');
    const nextBtn = wrapper.querySelector('.next-btn');

    const originalCards = Array.from(track.querySelectorAll('.slide-card'));
    const count = originalCards.length;
    if (count === 0) return;

    const firstClone1 = originalCards[0].cloneNode(true);
    const firstClone2 = originalCards[1 % count].cloneNode(true);
    const lastClone1 = originalCards[count - 1].cloneNode(true);
    const lastClone2 = originalCards[(count - 2 + count) % count].cloneNode(true);

    track.prepend(lastClone1);
    track.prepend(lastClone2);
    track.append(firstClone1);
    track.append(firstClone2);

    let currentIndex = 2;
    let isMoving = false;

    let startX = 0;
    let startY = 0;
    let baseScrollLeft = 0;
    let isHorizontalSwipe = false;
    let didSwipe = false;

    function getStep() {
        const cardWidth = originalCards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return cardWidth + gap;
    }

    function setInstantScroll(index) {
        currentIndex = index;
        const prevBehavior = track.style.scrollBehavior;
        track.style.scrollBehavior = 'auto';
        track.scrollLeft = getStep() * currentIndex;
        track.style.scrollBehavior = prevBehavior || '';
    }

    setInstantScroll(2);

    function checkLoopBounds() {
        if (currentIndex <= 1) {
            setInstantScroll(currentIndex + count);
        } else if (currentIndex >= count + 2) {
            setInstantScroll(currentIndex - count);
        }
    }

    function moveToSlide(index) {
        if (isMoving) return;
        isMoving = true;
        currentIndex = index;

        track.scrollTo({
            left: getStep() * currentIndex,
            behavior: 'smooth'
        });

        setTimeout(() => {
            checkLoopBounds();
            isMoving = false;
        }, 400);
    }

    track.addEventListener('touchstart', (e) => {
        if (isMoving || e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        baseScrollLeft = getStep() * currentIndex;
        isHorizontalSwipe = false;
        didSwipe = false;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (isMoving || e.touches.length !== 1) return;

        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        if (!isHorizontalSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
            isHorizontalSwipe = true;
            didSwipe = true;
        }

        if (!isHorizontalSwipe) return;

        if (e.cancelable) {
            e.preventDefault();
        }

        const step = getStep();
        const maxOffset = step;
        let offset = -dx;

        if (Math.abs(offset) > maxOffset) {
            const extra = Math.abs(offset) - maxOffset;
            offset = Math.sign(offset) * (maxOffset + extra * 0.2);
        }

        const prevBehavior = track.style.scrollBehavior;
        track.style.scrollBehavior = 'auto';
        track.scrollLeft = baseScrollLeft + offset;
        track.style.scrollBehavior = prevBehavior || '';
    }, { passive: false });

    track.addEventListener('touchend', (e) => {
        if (isMoving || !isHorizontalSwipe || !e.changedTouches.length) return;

        const dx = e.changedTouches[0].clientX - startX;
        const step = getStep();
        const threshold = Math.min(45, step * 0.18);

        if (dx < -threshold) {
            moveToSlide(currentIndex + 1);
        } else if (dx > threshold) {
            moveToSlide(currentIndex - 1);
        } else {
            moveToSlide(currentIndex);
        }

        isHorizontalSwipe = false;
    }, { passive: true });

    track.addEventListener('click', (e) => {
        if (didSwipe) {
            e.preventDefault();
            didSwipe = false;
        }
    });

    nextBtn.addEventListener('click', () => {
        moveToSlide(currentIndex + 1);
    });

    prevBtn.addEventListener('click', () => {
        moveToSlide(currentIndex - 1);
    });

    window.addEventListener('resize', () => {
        setInstantScroll(currentIndex);
    });
});

/* ==========================================
   2. Лента «Посмотреть другие номера»
   (на ПК 3 в ряд без прокрутки, на узких экранах — пошаговая скролл-лента)
   ========================================== */
document.querySelectorAll('.other-rooms-wrapper').forEach((wrapper) => {
    const track = wrapper.querySelector('.other-rooms-track');
    const prevBtn = wrapper.querySelector('.prev-btn');
    const nextBtn = wrapper.querySelector('.next-btn');
    if (!track || !prevBtn || !nextBtn) return;

    const cards = Array.from(track.querySelectorAll('.catalog-card'));
    const count = cards.length;
    if (count === 0) return;

    let currentIndex = 0;
    let isMoving = false;
    let startX = 0;
    let startY = 0;
    let baseScrollLeft = 0;
    let isHorizontalSwipe = false;
    let didSwipe = false;

    function isCarouselActive() {
        return getComputedStyle(track).display === 'flex';
    }

    function getStep() {
        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return cardWidth + gap;
    }

    function updateButtons() {
        if (!isCarouselActive()) return;
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= count - 1;
    }

    function moveToCard(index) {
        if (!isCarouselActive() || isMoving) return;
        currentIndex = Math.max(0, Math.min(count - 1, index));
        updateButtons();

        isMoving = true;
        track.scrollTo({
            left: getStep() * currentIndex,
            behavior: 'smooth'
        });

        setTimeout(() => {
            isMoving = false;
        }, 380);
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) moveToCard(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < count - 1) moveToCard(currentIndex + 1);
    });

    track.addEventListener('touchstart', (e) => {
        if (!isCarouselActive() || isMoving || e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        baseScrollLeft = getStep() * currentIndex;
        isHorizontalSwipe = false;
        didSwipe = false;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!isCarouselActive() || isMoving || e.touches.length !== 1) return;

        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        if (!isHorizontalSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
            isHorizontalSwipe = true;
            didSwipe = true;
        }

        if (!isHorizontalSwipe) return;

        if (e.cancelable) {
            e.preventDefault();
        }

        const step = getStep();
        let offset = -dx;

        if (Math.abs(offset) > step) {
            const extra = Math.abs(offset) - step;
            offset = Math.sign(offset) * (step + extra * 0.2);
        }

        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        let nextScroll = baseScrollLeft + offset;

        if (nextScroll < 0) {
            nextScroll = nextScroll * 0.25;
        } else if (nextScroll > maxScroll) {
            nextScroll = maxScroll + (nextScroll - maxScroll) * 0.25;
        }

        const prevBehavior = track.style.scrollBehavior;
        track.style.scrollBehavior = 'auto';
        track.scrollLeft = nextScroll;
        track.style.scrollBehavior = prevBehavior || '';
    }, { passive: false });

    track.addEventListener('touchend', (e) => {
        if (!isCarouselActive() || isMoving || !isHorizontalSwipe || !e.changedTouches.length) return;

        const dx = e.changedTouches[0].clientX - startX;
        const step = getStep();
        const threshold = Math.min(45, step * 0.18);

        if (dx < -threshold && currentIndex < count - 1) {
            moveToCard(currentIndex + 1);
        } else if (dx > threshold && currentIndex > 0) {
            moveToCard(currentIndex - 1);
        } else {
            moveToCard(currentIndex);
        }

        isHorizontalSwipe = false;
    }, { passive: true });

    track.addEventListener('click', (e) => {
        if (didSwipe) {
            e.preventDefault();
            didSwipe = false;
        }
    });

    function syncLayout() {
        if (!isCarouselActive()) {
            currentIndex = 0;
            track.scrollLeft = 0;
        } else {
            track.scrollLeft = getStep() * currentIndex;
            updateButtons();
        }
    }

    syncLayout();
    window.addEventListener('resize', syncLayout);
});

/* ==========================================
   3. Мобильная свайп-лента мозаики (по 1 фото с фиксацией + точки)
   ========================================== */
document.querySelectorAll('.mosaic-section').forEach((section) => {
    const grid = section.querySelector('.mosaic-grid');
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('.mosaic-item'));
    const count = items.length;
    if (count <= 1) return;

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'mosaic-dots';

    const dots = items.map((_, idx) => {
        const dot = document.createElement('span');
        dot.className = idx === 0 ? 'mosaic-dot active' : 'mosaic-dot';
        dotsContainer.appendChild(dot);
        return dot;
    });

    section.appendChild(dotsContainer);

    let currentIndex = 0;
    let isMoving = false;
    let startX = 0;
    let startY = 0;
    let baseScrollLeft = 0;
    let isHorizontalSwipe = false;
    let didSwipe = false;

    function isMobileCarousel() {
        return getComputedStyle(grid).display === 'flex';
    }

    function getStep() {
        const itemWidth = items[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(grid).gap) || 0;
        return itemWidth + gap;
    }

    function getTargetScroll(index) {
        const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
        if (index >= count - 1) return maxScroll;
        return Math.min(maxScroll, getStep() * index);
    }

    function updateDots(index) {
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(count - 1, index));
        updateDots(currentIndex);

        if (!isMobileCarousel()) return;

        isMoving = true;
        grid.scrollTo({
            left: getTargetScroll(currentIndex),
            behavior: 'smooth'
        });

        setTimeout(() => {
            isMoving = false;
        }, 380);
    }

    grid.addEventListener('touchstart', (e) => {
        if (!isMobileCarousel() || isMoving || e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        baseScrollLeft = getTargetScroll(currentIndex);
        isHorizontalSwipe = false;
        didSwipe = false;
    }, { passive: true });

    grid.addEventListener('touchmove', (e) => {
        if (!isMobileCarousel() || isMoving || e.touches.length !== 1) return;

        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        if (!isHorizontalSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
            isHorizontalSwipe = true;
            didSwipe = true;
        }

        if (!isHorizontalSwipe) return;

        if (e.cancelable) {
            e.preventDefault();
        }

        const step = getStep();
        let offset = -dx;

        if (Math.abs(offset) > step) {
            const extra = Math.abs(offset) - step;
            offset = Math.sign(offset) * (step + extra * 0.2);
        }

        const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
        let nextScroll = baseScrollLeft + offset;

        if (nextScroll < 0) {
            nextScroll = nextScroll * 0.25;
        } else if (nextScroll > maxScroll) {
            nextScroll = maxScroll + (nextScroll - maxScroll) * 0.25;
        }

        const prevBehavior = grid.style.scrollBehavior;
        grid.style.scrollBehavior = 'auto';
        grid.scrollLeft = nextScroll;
        grid.style.scrollBehavior = prevBehavior || '';
    }, { passive: false });

    grid.addEventListener('touchend', (e) => {
        if (!isMobileCarousel() || isMoving || !isHorizontalSwipe || !e.changedTouches.length) return;

        const dx = e.changedTouches[0].clientX - startX;
        const step = getStep();
        const threshold = Math.min(45, step * 0.18);

        if (dx < -threshold && currentIndex < count - 1) {
            goToSlide(currentIndex + 1);
        } else if (dx > threshold && currentIndex > 0) {
            goToSlide(currentIndex - 1);
        } else {
            goToSlide(currentIndex);
        }

        isHorizontalSwipe = false;
    }, { passive: true });

    grid.addEventListener('click', (e) => {
        if (didSwipe) {
            e.stopPropagation();
            e.preventDefault();
            didSwipe = false;
        }
    }, true);

    window.addEventListener('resize', () => {
        if (!isMobileCarousel()) {
            currentIndex = 0;
            grid.scrollLeft = 0;
            updateDots(0);
        } else {
            grid.scrollLeft = getTargetScroll(currentIndex);
        }
    });
});

/* ==========================================
   4. Лайтбокс для мозаичных галерей (Номера, СПА и др.)
   ========================================== */
const mosaicImages = Array.from(document.querySelectorAll('.mosaic-grid .mosaic-item img'));

if (mosaicImages.length > 0) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Закрыть">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                <line x1="6" y1="6" x2="18" y2="18"></line>
                <line x1="18" y1="6" x2="6" y2="18"></line>
            </svg>
        </button>
        <span class="lightbox-counter"></span>
        <button class="lightbox-btn lightbox-prev" aria-label="Предыдущее фото">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="11 6 5 12 11 18"></polyline>
            </svg>
        </button>
        <img class="lightbox-img" src="" alt="">
        <button class="lightbox-btn lightbox-next" aria-label="Следующее фото">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="13 6 19 12 13 18"></polyline>
            </svg>
        </button>
    `;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.lightbox-close');
    const counter = overlay.querySelector('.lightbox-counter');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');
    const fullImg = overlay.querySelector('.lightbox-img');

    let currentIdx = 0;
    let touchStartX = 0;

    function updateLightbox() {
        const target = mosaicImages[currentIdx];
        fullImg.src = target.src;
        fullImg.alt = target.alt || '';
        counter.textContent = `${currentIdx + 1} / ${mosaicImages.length}`;

        prevBtn.disabled = currentIdx === 0;
        nextBtn.disabled = currentIdx === mosaicImages.length - 1;
    }

    function openLightbox(index) {
        currentIdx = index;
        updateLightbox();
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    mosaicImages.forEach((img, index) => {
        const item = img.closest('.mosaic-item');
        if (item) {
            item.addEventListener('click', () => openLightbox(index));
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIdx > 0) {
            currentIdx--;
            updateLightbox();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIdx < mosaicImages.length - 1) {
            currentIdx++;
            updateLightbox();
        }
    });

    closeBtn.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && currentIdx > 0) {
            currentIdx--;
            updateLightbox();
        }
        if (e.key === 'ArrowRight' && currentIdx < mosaicImages.length - 1) {
            currentIdx++;
            updateLightbox();
        }
    });

    overlay.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
        }
    }, { passive: true });

    overlay.addEventListener('touchend', (e) => {
        if (!e.changedTouches.length) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (dx < -40 && currentIdx < mosaicImages.length - 1) {
            currentIdx++;
            updateLightbox();
        } else if (dx > 40 && currentIdx > 0) {
            currentIdx--;
            updateLightbox();
        }
    }, { passive: true });
}