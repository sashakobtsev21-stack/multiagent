# Фикс витрины v2 — чистая CSS-крутилка (непрерывная, не зависит от кэша JS)

Предыдущая JS-крутилка (scrollLeft + rAF) могла «не ехать» из-за кэша `/js/showcase-rail.js` или prefers-reduced-motion. Переносим движение на CSS-анимацию в самом компоненте (деплоится вместе со страницей, кэш JS больше ни на что не влияет).

Применить в каждом репо: `src/components/ShowcaseRail.astro` + `public/js/showcase-rail.js`.

## 1. `src/components/ShowcaseRail.astro` — рендер 2 копий (для бесшовной CSS-петли)
Сейчас (после прошлого фикса) рендерится ОДИН набор:
```
const cells = items.map((it) => ({ ...it, clone: false }));
```
Заменить на ДВЕ копии (вторая — клон, aria-hidden уже обрабатывается по полю `clone` в разметке):
```
const cells = [
  ...items.map((it) => ({ ...it, clone: false })),
  ...items.map((it) => ({ ...it, clone: true })),
];
```

## 2. CSS в `<style>` того же компонента
- `.showcase__viewport`: заменить `overflow-x: auto;` на `overflow: hidden;` (вертикаль и так hidden). Маску (`mask-image`) и прочее оставить.
- `.showcase__track`: добавить анимацию:
```
animation: showcase-marquee var(--showcase-dur, 60s) linear infinite;
```
- Добавить keyframes (одна копия = 50% ширины дорожки из двух копий → бесшовно):
```
@keyframes showcase-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
```
- Пауза при наведении/фокусе (вместо JS):
```
.showcase:hover .showcase__track,
.showcase__track:focus-within { animation-play-state: paused; }
```
- В существующий блок `@media (prefers-reduced-motion: reduce)` добавить:
```
.showcase__track { animation: none; transform: none; }
.showcase__viewport { overflow-x: auto; }
```
- Убрать ставшее ненужным CSS-правило спотлайта через scroll, если мешает (`.is-grabbing` курсор можно оставить — он безвреден).

## 3. `public/js/showcase-rail.js` — заменить ПОЛНОСТЬЮ на минимальную версию
Движение теперь чисто CSS. JS только задаёт скорость (длительность ∝ ширине набора, ~40 px/с) и тач-раскрытие карточек-заведений. Даже если у пользователя закэширован старый JS — на overflow:hidden его scrollLeft ничего не двигает, а CSS-анимация работает с дефолтной длительностью.
```js
/*
 * showcase-rail.js — витрина: движение задаётся CSS-анимацией (.showcase__track,
 * @keyframes showcase-marquee). Здесь только: (1) выставить длительность ∝ ширине
 * набора, чтобы скорость была одинаковой при любом числе карточек; (2) тач-тап по
 * карточке-заведению раскрывает описание. Лайтбокс/галерея — отдельные скрипты.
 */
(() => {
  const rail = document.querySelector('[data-showcase]');
  if (!rail) return;
  const track = rail.querySelector('[data-showcase-track]');
  if (track) {
    const setWidth = track.scrollWidth / 2; // дорожка = 2 копии
    if (setWidth > 0) {
      const dur = Math.max(20, Math.round(setWidth / 40)); // ~40 px/с
      track.style.setProperty('--showcase-dur', dur + 's');
    }
  }
  // Тач: тап по карточке-заведению раскрывает поповер (нет :hover на тач).
  rail.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch') return;
    const card = e.target.closest('[data-scard-place]');
    if (!card) return;
    if (e.target.closest('[data-gallery-item],[data-rcard-prev],[data-rcard-next],a')) return;
    const open = card.classList.contains('is-open');
    rail.querySelectorAll('[data-scard-place]').forEach((c) => c.classList.remove('is-open'));
    if (!open) card.classList.add('is-open');
  });
})();
```

## Проверка
- `npm run build` + `npm run check` + `npm test` + `npm run test:links` + `npm run lint` — зелёные.
- В `dist/index.html`: `.showcase__track` имеет 2 копии набора (клоны `aria-hidden`), у трека есть `animation: showcase-marquee`, keyframes присутствуют в инлайн-стилях, у viewport `overflow: hidden`.
- Поведение: лента едет непрерывно по кругу слева-направо без остановки и без рывка на стыке; пауза при наведении.
