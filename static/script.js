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

    function getStep() {
        const cardWidth = originalCards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return cardWidth + gap;
    }

    // Ставим начальную позицию без анимации
    track.scrollLeft = getStep() * currentIndex;

    function moveToSlide(index) {
        if (isMoving) return;
        isMoving = true;
        currentIndex = index;

        track.scrollTo({
            left: getStep() * currentIndex,
            behavior: 'smooth'
        });

        setTimeout(() => {
            // Если доехали до левого клона (индекс 1) -> прыгаем на последний оригинал
            if (currentIndex <= 1) {
                currentIndex = count + 1;
                track.scrollLeft = getStep() * currentIndex;
            } 
            // Если доехали до правого клона (индекс count + 2) -> прыгаем на первый оригинал
            else if (currentIndex >= count + 2) {
                currentIndex = 2;
                track.scrollLeft = getStep() * currentIndex;
            }
            isMoving = false;
        }, 450);
    }

    nextBtn.addEventListener('click', () => {
        moveToSlide(currentIndex + 1);
    });

    prevBtn.addEventListener('click', () => {
        moveToSlide(currentIndex - 1);
    });

    window.addEventListener('resize', () => {
        track.scrollLeft = getStep() * currentIndex;
    });
});