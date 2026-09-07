/**
 * Animated Moodboard Photo Frame Controller
 * Projekt Traum - Gregor Skrzeszewski
 */
(function () {
  'use strict';

  function initFrameSlider() {
    const frame = document.getElementById('tm-wallpaper-frame');
    if (!frame) return;

    const slides = frame.querySelectorAll('.tm-frame-slide');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    let timer = null;
    let isPaused = false;
    const intervalMs = 4500;

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
    }

    function nextSlide() {
      if (!isPaused) {
        showSlide(currentIndex + 1);
      }
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(nextSlide, intervalMs);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Interakcje myszą
    frame.addEventListener('mouseenter', function () {
      isPaused = true;
    });

    frame.addEventListener('mouseleave', function () {
      isPaused = false;
    });

    // Kliknięcie w ramkę przełącza na kolejny slajd
    frame.addEventListener('click', function () {
      showSlide(currentIndex + 1);
      startTimer();
    });

    // Start pętli
    startTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFrameSlider);
  } else {
    initFrameSlider();
  }
})();
