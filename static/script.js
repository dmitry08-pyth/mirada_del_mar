document.querySelectorAll('.slider-wrapper').forEach((wrapper) => {
    const track = wrapper.querySelector('.slider-track');
    const prevBtn = wrapper.querySelector('.prev-btn');
    const nextBtn = wrapper.querySelector('.next-btn');

    const originalCards = Array.from(track.querySelectorAll('.slide-card'));
    if (originalCards.length === 0) return;

    const firstClone = originalCards[0].cloneNode(true);
    const lastClone = originalCards[originalCards.length - 1].cloneNode(true);

    track.prepend(lastClone);
    track.append(firstClone);

    let currentIndex = 1; // Начинаем с 1-й настоящей карточки
    let isMoving = false; // Защита от двойного клика во время анимации

    function getStep() {
        const cardWidth = originalCards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return cardWidth + gap;
    }

    // Ставим начальную позицию без анимации
    track.scrollLeft = getStep() * currentIndex;

    // Функция плавного перехода к нужному слайду
    function moveToSlide(index) {
        if (isMoving) return;
        isMoving = true;
        currentIndex = index;

        track.scrollTo({
            left: getStep() * currentIndex,
            behavior: 'smooth'
        });

        // Ждем завершения плавной прокрутки (450 мс) и проверяем, не попали ли на клон
        setTimeout(() => {
            if (currentIndex === 0) {
                currentIndex = originalCards.length;
                track.scrollLeft = getStep() * currentIndex; // Мгновенный прыжок без smooth
            } else if (currentIndex === originalCards.length + 1) {
                currentIndex = 1;
                track.scrollLeft = getStep() * currentIndex; // Мгновенный прыжок без smooth
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

    // Подстраховка при изменении размера окна (чтобы слайд не съезжал)
    window.addEventListener('resize', () => {
        track.scrollLeft = getStep() * currentIndex;
    });
});