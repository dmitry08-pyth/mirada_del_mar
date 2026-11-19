document.querySelectorAll('.slider-wrapper').forEach((wrapper) => {
    const track = wrapper.querySelector('.slider-track');
    const prevBtn = wrapper.querySelector('.prev-btn');
    const nextBtn = wrapper.querySelector('.next-btn');

    const originalCards = Array.from(track.querySelectorAll('.slide-card'));
    const count = originalCards.length;
    if (count === 0) return;

    // Берем по 2 карточки с каждого края для плавного предпросмотра соседей
    const firstClone1 = originalCards[0].cloneNode(true);
    const firstClone2 = originalCards[1 % count].cloneNode(true);
    const lastClone1 = originalCards[count - 1].cloneNode(true);
    const lastClone2 = originalCards[(count - 2 + count) % count].cloneNode(true);

    // Вставляем в начало: [предпоследний_клон, последний_клон]
    track.prepend(lastClone1);
    track.prepend(lastClone2);

    // Вставляем в конец: [первый_клон, второй_клон]
    track.append(firstClone1);
    track.append(firstClone2);

    // Начинаем с индекса 2 (так как в начале теперь 2 клона: индексы 0 и 1)
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

    // Ставим начальную позицию без анимации
    setInstantScroll(2);

    function checkLoopBounds() {
        // Левый край: клоны на индексах 0 и 1
        if (currentIndex <= 1) {
            setInstantScroll(currentIndex + count);
        }
        // Правый край: клоны на индексах count + 2 и count + 3
        else if (currentIndex >= count + 2) {
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

    // Блокируем случайный переход по ссылке, если только что был свайп
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