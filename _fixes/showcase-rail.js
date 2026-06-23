/*
 * showcase-rail.js — витрина на главной (§8.4/§16): БЕСШОВНАЯ НЕПРЕРЫВНАЯ крутилка.
 * Прогрессивное улучшение поверх отрендеренной ленты (CSP script-src 'self').
 *
 * Ключевое: лента крутится ПО КРУГУ и НЕ останавливается даже при малом числе
 * карточек. JS клонирует уникальный набор карточек столько раз, чтобы общая
 * ширина дорожки была >= 2.5x ширины вьюпорта → всегда есть запас для движения.
 * Петля заворачивается ровно на ширину ОДНОГО уникального набора → бесшовно,
 * без рывка. Клоны скрыты от a11y (aria-hidden, не в фокус-порядке).
 *
 * Поведение сохранено: пауза, пока курсор/фокус на карточке (спотлайт);
 * drag/свайп и нативная горизонтальная прокрутка; prefers-reduced-motion —
 * без авто-движения; клик-vs-drag (клик по фото долетает до лайтбокса).
 */
(() => {
  const rail = document.querySelector('[data-showcase]');
  if (!rail) return;
  const vp = rail.querySelector('[data-showcase-viewport]');
  const track = rail.querySelector('[data-showcase-track]');
  if (!vp || !track) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPEED = 0.4; // px/кадр — медленно

  // Уникальный набор карточек — как отрендерил Astro (без статических клонов).
  const unit = Array.from(track.children);
  if (!unit.length) return;

  let unitWidth = 0;
  const measure = () => {
    unitWidth = 0;
    for (const c of unit) {
      const cs = getComputedStyle(c);
      const mr = parseFloat(cs.marginInlineEnd) || parseFloat(cs.marginRight) || 0;
      unitWidth += c.getBoundingClientRect().width + mr;
    }
  };

  // Доклонировать набор столько раз, чтобы дорожка была заметно шире вьюпорта.
  const refill = () => {
    track.querySelectorAll('[data-clone]').forEach((c) => c.remove());
    measure();
    if (unitWidth <= 0) return;
    const need = vp.clientWidth * 2.5 + unitWidth;
    let total = unitWidth;
    let guard = 0;
    while (total < need && guard < 40) {
      for (const c of unit) {
        const clone = c.cloneNode(true);
        clone.dataset.clone = '1';
        clone.setAttribute('aria-hidden', 'true');
        clone
          .querySelectorAll('a,button,[tabindex],input,select,textarea')
          .forEach((el) => el.setAttribute('tabindex', '-1'));
        track.appendChild(clone);
      }
      total += unitWidth;
      guard++;
    }
  };

  let dragging = false;
  let captured = false;
  let hovering = false;
  let focusWithin = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;
  let activePointer = null;
  let pos = 0;

  const wrap = (p) => {
    if (unitWidth <= 0) return p;
    if (p >= unitWidth) return p % unitWidth;
    if (p < 0) return ((p % unitWidth) + unitWidth) % unitWidth;
    return p;
  };

  const tick = () => {
    if (!reduce && !dragging && !hovering && !focusWithin && unitWidth > 0) {
      pos = wrap(pos + SPEED);
      vp.scrollLeft = pos;
    }
    requestAnimationFrame(tick);
  };

  // Ручная прокрутка / drag / колесо меняют scrollLeft мимо аккумулятора — ресинк.
  vp.addEventListener('scroll', () => {
    if (Math.abs(vp.scrollLeft - pos) > 2) pos = wrap(vp.scrollLeft);
  });

  // --- Drag (захват указателя только после реального движения) ---
  vp.addEventListener('pointerdown', (e) => {
    if (e.button && e.button !== 0) return;
    dragging = true;
    captured = false;
    moved = false;
    activePointer = e.pointerId;
    startX = e.clientX;
    startScroll = vp.scrollLeft;
  });
  vp.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 4) {
      moved = true;
      vp.classList.add('is-grabbing');
      try {
        vp.setPointerCapture(e.pointerId);
        captured = true;
      } catch {
        /* no-op */
      }
    }
    if (moved) vp.scrollLeft = startScroll - dx;
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    vp.classList.remove('is-grabbing');
    if (captured) {
      try {
        vp.releasePointerCapture(e.pointerId ?? activePointer);
      } catch {
        /* no-op */
      }
      captured = false;
    }
    activePointer = null;
  };
  vp.addEventListener('pointerup', endDrag);
  vp.addEventListener('pointercancel', endDrag);
  vp.addEventListener('dragstart', (e) => e.preventDefault());
  vp.addEventListener(
    'click',
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true,
  );

  // Пауза при фокусе с клавиатуры (a11y).
  rail.addEventListener('focusin', () => {
    focusWithin = true;
  });
  rail.addEventListener('focusout', () => {
    focusWithin = false;
  });

  // Пауза + спотлайт, пока курсор над любой карточкой (делегирование — покрывает и клоны).
  rail.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    if (e.target.closest('.showcase__cell')) hovering = true;
  });
  rail.addEventListener('pointerout', (e) => {
    if (e.pointerType === 'touch') return;
    const to = e.relatedTarget;
    if (!to || !rail.contains(to) || !to.closest('.showcase__cell')) hovering = false;
  });

  // Тач: тап по карточке заведения раскрывает описание (нет :hover). Делегирование.
  rail.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch' || moved) return;
    const card = e.target.closest('[data-scard-place]');
    if (!card) return;
    if (e.target.closest('[data-gallery-item],[data-rcard-prev],[data-rcard-next],a')) return;
    const open = card.classList.contains('is-open');
    rail.querySelectorAll('[data-scard-place]').forEach((c) => c.classList.remove('is-open'));
    if (!open) card.classList.add('is-open');
  });

  // Перестроить дорожку при ресайзе (ширина вьюпорта/карточек меняется).
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      refill();
      pos = wrap(pos);
    }, 200);
  });

  refill();
  pos = 0;
  vp.scrollLeft = 0;
  requestAnimationFrame(tick);
})();
