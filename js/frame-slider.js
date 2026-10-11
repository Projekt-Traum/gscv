/**
 * Animated Moodboard Photo Frame & Sketch Slideshow Controller
 * Projekt Traum - Gregor Skrzeszewski
 */
(function () {
  'use strict';

  function setupSlideshow(containerId, slideClass, intervalMs, initialOffsetMs) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const slides = container.querySelectorAll(slideClass);
    if (slides.length <= 1) return;

    let currentIndex = 0;
    let timer = null;
    let isPaused = false;

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

    // Interakcje myszą - pauza na hover
    container.addEventListener('mouseenter', function () {
      isPaused = true;
    });

    container.addEventListener('mouseleave', function () {
      isPaused = false;
    });

    // Kliknięcie w element przełącza na kolejny slajd
    container.addEventListener('click', function () {
      showSlide(currentIndex + 1);
      startTimer();
    });

    // Start pętli z opcjonalnym przesunięciem czasowym
    if (initialOffsetMs) {
      setTimeout(function () {
        startTimer();
      }, initialOffsetMs);
    } else {
      startTimer();
    }
  }

  function initAllSliders() {
    // 1. Centralna ramka ze zdjęciami wnętrz
    setupSlideshow('tm-wallpaper-frame', '.tm-frame-slide', 4500, 0);

    // 2. Baner filozofii na mosiężnym pasku po prawej stronie (przesunięty o 1.5s)
    setupSlideshow('tm-brass-banner-frame', '.tm-banner-slide', 4500, 1500);

    // 3. Szkicownik architektoniczny w lewym dolnym rogu (przesunięty w fazie o 3.0s)
    setupSlideshow('tm-sketch-frame', '.tm-sketch-slide', 4500, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSliders);
  } else {
    initAllSliders();
  }
})();
