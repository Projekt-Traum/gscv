/**
 * Projekt Traum – Interaktywny System Pozycjonowania Obiektów (Visual Positioner HUD)
 * Umożliwia swobodne przesuwanie obiektów myszką w czasie rzeczywistym i generowanie kodu CSS.
 * 
 * Jak włączyć:
 * 1. Skrót klawiszowy: Alt + P lub Ctrl + Shift + P
 * 2. Przez URL: dodaj ?pos do adresu strony (np. index.html?pos)
 * 3. W konsoli przeglądarki: enablePositioner()
 */
(function () {
  'use strict';

  const OBJECTS_CONFIG = [
    {
      id: 'brand',
      name: '1. Wizytówka Projekt Traum (Brand Panel)',
      selector: '.tm-stone-brand-panel',
      varX: '--brand-x',
      varY: '--brand-y',
      varScale: '--brand-scale',
      varRotate: '--brand-rotate',
      type: 'center'
    },
    {
      id: 'photo',
      name: '2. Centralna Ramka Zdjęć (Photo Frame)',
      selector: '.tm-wallpaper-frame',
      varX: '--photo-frame-x',
      varY: '--photo-frame-y',
      varScale: '--photo-frame-scale',
      varRotate: '--photo-frame-rotate',
      type: 'center'
    },
    {
      id: 'sketch',
      name: '3. Animowany Szkicownik (Sketch Frame)',
      selector: '.tm-sketch-frame',
      varX: '--sketch-x',
      varY: '--sketch-y',
      varScale: '--sketch-scale',
      varRotate: '--sketch-rotate',
      type: 'center'
    },
    {
      id: 'banner',
      name: '4. Baner Filozofii (Brass Banner)',
      selector: '.tm-banner-frame',
      varRight: '--banner-right',
      varY: '--banner-y',
      varScale: '--banner-scale',
      varRotate: '--banner-rotate',
      type: 'right'
    },
    {
      id: 'oakNav',
      name: '5. Panel Nawigacji Dębowa Deska (Oak Nav)',
      selector: '.tm-oak-nav-panel',
      varX: '--oak-nav-x',
      varY: '--oak-nav-y',
      varScale: '--oak-nav-scale',
      varRotate: '--oak-nav-rotate',
      type: 'center'
    },
    {
      id: 'footer',
      name: '6. Stopka Strony (Wallpaper Footer)',
      selector: '.tm-wallpaper-footer',
      varX: '--footer-x',
      varY: '--footer-y',
      varScale: '--footer-scale',
      varRotate: '--footer-rotate',
      type: 'center'
    }
  ];

  let isPositionerActive = false;
  let hudContainer = null;
  let activeDragItem = null;
  let dragOffset = { x: 0, y: 0 };

  function initPositioner() {
    // Sprawdź parametr w URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('pos') || urlParams.has('edit') || urlParams.has('debug')) {
      activatePositioner();
    }

    // Skróty klawiszowe Alt+P lub Ctrl+Shift+P
    window.addEventListener('keydown', function (e) {
      if ((e.altKey && (e.key === 'p' || e.key === 'P')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P'))) {
        e.preventDefault();
        togglePositioner();
      }
    });

    // Globalna funkcja w konsoli
    window.enablePositioner = activatePositioner;
    window.togglePositioner = togglePositioner;
  }

  function togglePositioner() {
    if (isPositionerActive) {
      deactivatePositioner();
    } else {
      activatePositioner();
    }
  }

  function activatePositioner() {
    if (isPositionerActive) return;
    isPositionerActive = true;

    buildHUD();
    attachDragListeners();
    document.body.classList.add('pt-positioner-active');
  }

  function deactivatePositioner() {
    if (!isPositionerActive) return;
    isPositionerActive = false;

    if (hudContainer) {
      hudContainer.remove();
      hudContainer = null;
    }
    detachDragListeners();
    document.body.classList.remove('pt-positioner-active');
  }

  function buildHUD() {
    if (hudContainer) return;

    hudContainer = document.createElement('div');
    hudContainer.id = 'pt-positioner-hud';
    hudContainer.innerHTML = `
      <div class="pt-hud-header">
        <div class="pt-hud-title">
          <span class="pt-hud-icon">🎯</span>
          <strong>Pozycjonowanie Obiektów</strong>
        </div>
        <div class="pt-hud-controls">
          <button type="button" class="pt-hud-btn-copy" id="pt-hud-copy" title="Kopiuj CSS do schowka">📋 Kopiuj CSS</button>
          <button type="button" class="pt-hud-btn-close" id="pt-hud-close" title="Zamknij (Alt+P)">✕</button>
        </div>
      </div>
      <div class="pt-hud-body">
        <div class="pt-hud-hint">Przeciągaj obiekty myszką na ekranie lub precyzyjnie koryguj wartości poniżej:</div>
        <div class="pt-hud-list" id="pt-hud-list"></div>
        <div class="pt-hud-output">
          <label>Wygenerowany kod CSS do wklejenia w :root w tooplate-style.css:</label>
          <textarea id="pt-css-output" readonly></textarea>
        </div>
      </div>
    `;

    // Style dla panelu HUD
    const styleEl = document.createElement('style');
    styleEl.id = 'pt-positioner-styles';
    styleEl.textContent = `
      #pt-positioner-hud {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        max-width: calc(100vw - 40px);
        max-height: 85vh;
        background: rgba(18, 16, 22, 0.96);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(218, 165, 95, 0.95);
        border-radius: 12px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(207,163,101,0.3);
        color: #f0ede6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        user-select: none;
      }
      .pt-hud-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: rgba(30, 26, 36, 0.9);
        border-bottom: 1px solid rgba(218, 165, 95, 0.3);
      }
      .pt-hud-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #f4d08b;
        font-size: 14px;
      }
      .pt-hud-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pt-hud-btn-copy {
        background: #CFA365;
        color: #121016;
        border: none;
        padding: 5px 10px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pt-hud-btn-copy:hover {
        background: #f4d08b;
        transform: scale(1.05);
      }
      .pt-hud-btn-close {
        background: transparent;
        border: none;
        color: #aaa;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
      }
      .pt-hud-btn-close:hover {
        color: #fff;
      }
      .pt-hud-body {
        padding: 14px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .pt-hud-hint {
        font-size: 11.5px;
        color: #bbb;
        line-height: 1.4;
      }
      .pt-hud-item {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .pt-hud-item-title {
        font-weight: 600;
        color: #e6dfd5;
        font-size: 12px;
      }
      .pt-hud-inputs-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .pt-hud-field {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .pt-hud-field label {
        font-size: 10.5px;
        color: #999;
      }
      .pt-hud-field input {
        background: rgba(0,0,0,0.4);
        border: 1px solid rgba(218, 165, 95, 0.4);
        border-radius: 4px;
        color: #fff;
        padding: 4px 6px;
        font-size: 12px;
        font-family: monospace;
      }
      .pt-hud-field input:focus {
        border-color: #f4d08b;
        outline: none;
      }
      .pt-hud-output {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .pt-hud-output label {
        font-size: 11px;
        color: #f4d08b;
        font-weight: 600;
      }
      .pt-hud-output textarea {
        background: #09080c;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 6px;
        color: #70d6ff;
        font-family: monospace;
        font-size: 11px;
        height: 110px;
        padding: 8px;
        resize: vertical;
      }
      /* Klasy dla przeciąganych obiektów w trybie edycji */
      .pt-positioner-active .tm-stone-brand-panel,
      .pt-positioner-active .tm-wallpaper-frame,
      .pt-positioner-active .tm-sketch-frame,
      .pt-positioner-active .tm-banner-frame,
      .pt-positioner-active .tm-oak-nav-panel,
      .pt-positioner-active .tm-wallpaper-footer {
        cursor: grab !important;
        outline: 2px dashed rgba(244, 208, 139, 0.85) !important;
        outline-offset: 4px !important;
      }
      .pt-positioner-active .tm-stone-brand-panel:active,
      .pt-positioner-active .tm-wallpaper-frame:active,
      .pt-positioner-active .tm-sketch-frame:active,
      .pt-positioner-active .tm-banner-frame:active,
      .pt-positioner-active .tm-oak-nav-panel:active,
      .pt-positioner-active .tm-wallpaper-footer:active {
        cursor: grabbing !important;
        outline-color: #ff9e00 !important;
      }
    `;

    document.head.appendChild(styleEl);
    document.body.appendChild(hudContainer);

    renderHUDItems();
    updateCSSTextarea();

    // Eventy przycisków w HUD
    document.getElementById('pt-hud-close').addEventListener('click', deactivatePositioner);
    document.getElementById('pt-hud-copy').addEventListener('click', function () {
      const textarea = document.getElementById('pt-css-output');
      textarea.select();
      navigator.clipboard.writeText(textarea.value).then(() => {
        const copyBtn = document.getElementById('pt-hud-copy');
        const originalText = copyBtn.innerText;
        copyBtn.innerText = '✓ Skopiowano!';
        setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
      });
    });
  }

  function renderHUDItems() {
    const listEl = document.getElementById('pt-hud-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const rootStyles = getComputedStyle(document.documentElement);

    OBJECTS_CONFIG.forEach((cfg) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'pt-hud-item';

      let valX = cfg.varX ? rootStyles.getPropertyValue(cfg.varX).trim() : '';
      let valY = cfg.varY ? rootStyles.getPropertyValue(cfg.varY).trim() : '';
      let valRight = cfg.varRight ? rootStyles.getPropertyValue(cfg.varRight).trim() : '';
      let valScale = cfg.varScale ? rootStyles.getPropertyValue(cfg.varScale).trim() : '1';
      let valRotate = cfg.varRotate ? rootStyles.getPropertyValue(cfg.varRotate).trim() : '0deg';

      itemEl.innerHTML = `
        <div class="pt-hud-item-title">${cfg.name}</div>
        <div class="pt-hud-inputs-row">
          ${cfg.varX ? `
            <div class="pt-hud-field">
              <label>Pozycja X (od lewej):</label>
              <input type="text" data-var="${cfg.varX}" value="${valX}">
            </div>
          ` : ''}
          ${cfg.varRight ? `
            <div class="pt-hud-field">
              <label>Pozycja X (od prawej):</label>
              <input type="text" data-var="${cfg.varRight}" value="${valRight}">
            </div>
          ` : ''}
          <div class="pt-hud-field">
            <label>Pozycja Y (od góry):</label>
            <input type="text" data-var="${cfg.varY}" value="${valY}">
          </div>
          <div class="pt-hud-field">
            <label>Skala (Scale):</label>
            <input type="text" data-var="${cfg.varScale}" value="${valScale}">
          </div>
          <div class="pt-hud-field">
            <label>Obrót (Rotate):</label>
            <input type="text" data-var="${cfg.varRotate}" value="${valRotate}">
          </div>
        </div>
      `;

      itemEl.querySelectorAll('input').forEach((input) => {
        input.addEventListener('input', function () {
          const varName = this.getAttribute('data-var');
          document.documentElement.style.setProperty(varName, this.value);
          updateCSSTextarea();
        });
      });

      listEl.appendChild(itemEl);
    });
  }

  function updateCSSTextarea() {
    const textarea = document.getElementById('pt-css-output');
    if (!textarea) return;

    const rootStyles = getComputedStyle(document.documentElement);
    let output = `/* Skopiuj i wklej do sekcji :root w css/tooplate-style.css */\n`;

    OBJECTS_CONFIG.forEach((cfg) => {
      if (cfg.varX) output += `  ${cfg.varX}: ${rootStyles.getPropertyValue(cfg.varX).trim()};\n`;
      if (cfg.varRight) output += `  ${cfg.varRight}: ${rootStyles.getPropertyValue(cfg.varRight).trim()};\n`;
      if (cfg.varY) output += `  ${cfg.varY}: ${rootStyles.getPropertyValue(cfg.varY).trim()};\n`;
      if (cfg.varScale) output += `  ${cfg.varScale}: ${rootStyles.getPropertyValue(cfg.varScale).trim()};\n`;
      if (cfg.varRotate) output += `  ${cfg.varRotate}: ${rootStyles.getPropertyValue(cfg.varRotate).trim()};\n`;
      output += `\n`;
    });

    textarea.value = output.trim();
  }

  function attachDragListeners() {
    OBJECTS_CONFIG.forEach((cfg) => {
      const el = document.querySelector(cfg.selector);
      if (!el) return;

      el._ptMouseDownHandler = function (e) {
        if (!isPositionerActive) return;
        // Ignoruj kliknięcie w elementy formularza/linki wewnątrz jeśli użytkownik nie przeciąga
        e.preventDefault();
        e.stopPropagation();

        activeDragItem = {
          cfg: cfg,
          el: el,
          startClientX: e.clientX,
          startClientY: e.clientY
        };

        const parent = el.closest('.tm-wallpaper-interactive-layer') || document.body;
        const parentRect = parent.getBoundingClientRect();
        activeDragItem.parentRect = parentRect;

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };

      el.addEventListener('mousedown', el._ptMouseDownHandler);
    });
  }

  function detachDragListeners() {
    OBJECTS_CONFIG.forEach((cfg) => {
      const el = document.querySelector(cfg.selector);
      if (el && el._ptMouseDownHandler) {
        el.removeEventListener('mousedown', el._ptMouseDownHandler);
      }
    });
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    if (!activeDragItem) return;

    const { cfg, parentRect } = activeDragItem;
    const clientX = e.clientX;
    const clientY = e.clientY;

    const percentX = ((clientX - parentRect.left) / parentRect.width) * 100;
    const percentY = ((clientY - parentRect.top) / parentRect.height) * 100;
    const percentRight = 100 - percentX;

    if (cfg.type === 'right' && cfg.varRight) {
      const clampedRight = Math.max(-50, Math.min(100, percentRight)).toFixed(2) + '%';
      const clampedY = Math.max(-20, Math.min(120, percentY)).toFixed(2) + '%';
      document.documentElement.style.setProperty(cfg.varRight, clampedRight);
      document.documentElement.style.setProperty(cfg.varY, clampedY);
    } else {
      const clampedX = Math.max(-20, Math.min(120, percentX)).toFixed(2) + '%';
      const clampedY = Math.max(-20, Math.min(120, percentY)).toFixed(2) + '%';
      if (cfg.varX) document.documentElement.style.setProperty(cfg.varX, clampedX);
      if (cfg.varY) document.documentElement.style.setProperty(cfg.varY, clampedY);
    }

    renderHUDItems();
    updateCSSTextarea();
  }

  function onMouseUp() {
    if (!activeDragItem) return;
    activeDragItem = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPositioner);
  } else {
    initPositioner();
  }
})();
