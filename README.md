# Flora

Лендінг квіткового магазину **Flora** — навчальний проєкт дисципліни
«Практикум сучасних методологій розробки ПЗ».

Сайт створено за [макетом Figma](https://www.figma.com/design/lFpZZ7k7sN1KN6aVucGuOc/Flora--KhoroshkoSV-)
з адаптивною версткою за принципом mobile-first.

## Про проєкт

Односторінковий сайт квіткового магазину: hero-блок, розділ про майстерню,
слайдер найпопулярніших букетів, каталог букетів, відгуки клієнтів, контакти
та мобільне меню.

## Технології

- Семантичний HTML5
- JavaScript: axios (HTTP-запити, async/await), динамічна розмітка, пагінація Load More, модальні вікна
- CSS3: кастомні властивості (змінні), Flexbox, медіазапити (mobile-first, брейкпоінти 375/768/1440)
- modern-normalize
- SVG-спрайт для іконок
- Бібліотека анімацій [AOS](https://michalsnik.github.io/aos/)
- JavaScript для мобільного меню (клас `is-open`)
- Шрифти Google Fonts: Hanuman, Roboto
- Mock API: json-server (локально) / my-json-server.typicode.com (для живої сторінки)

## Як запустити локально

1. Клонувати репозиторій:

   ```
   git clone https://github.com/SergeKhoroshko/UMT-markup-practice_P1-KhoroshkoSV.git
   ```

2. Запустити локальний сервер у папці проєкту (SVG-спрайт не працює
   при відкритті сторінки напряму через `file://`), наприклад:

   ```
   npx serve .
   ```

   або відкрити проєкт у VS Code та скористатися розширенням Live Server.

3. В окремому терміналі запустити mock API (дані каталогу — у файлі `db.json`):

   ```
   npx json-server db.json --port 3000
   ```

   Локальна сторінка звертається до `http://localhost:3000/bouquets`.
   Жива сторінка на GitHub Pages замість цього використовує безкоштовний сервіс
   [my-json-server](https://my-json-server.typicode.com/SergeKhoroshko/UMT-markup-practice_P1-KhoroshkoSV/bouquets),
   який читає той самий `db.json` з репозиторію.

## Жива сторінка

Проєкт задеплоєно на GitHub Pages:
<https://sergekhoroshko.github.io/UMT-markup-practice_P1-KhoroshkoSV/>
