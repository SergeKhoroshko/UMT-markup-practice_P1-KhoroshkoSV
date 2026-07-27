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
- Backend API: [Flora Backend](https://github.com/SergeKhoroshko/UMT-backend-practice_P3-KhoroshkoSV) — Express + PostgreSQL + Sequelize, задеплоєний на Render

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

3. Дані каталогу сторінка отримує з власного backend
   ([репозиторій](https://github.com/SergeKhoroshko/UMT-backend-practice_P3-KhoroshkoSV)):

   - жива сторінка звертається до задеплоєного API
     <https://flora-backend-hutt.onrender.com/api/bouquets>
     (документація: [Swagger UI](https://flora-backend-hutt.onrender.com/api-docs));
   - локальна сторінка звертається до `http://localhost:3000/api/bouquets` —
     запустіть backend локально за інструкцією з його README.

   Безкоштовний інстанс Render "засинає" після ~15 хвилин простою, тому
   перший запит може тривати до хвилини — сторінка в цей час показує лоадер.

## Жива сторінка

Проєкт задеплоєно на GitHub Pages:
<https://sergekhoroshko.github.io/UMT-markup-practice_P1-KhoroshkoSV/>
