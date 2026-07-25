# Flora

Лендінг квіткового магазину **Flora** — навчальний проєкт дисципліни
«Практикум сучасних методологій розробки ПЗ».

Сайт створено за [макетом Figma](https://www.figma.com/design/2Tj16H7IO7dq1ViTvIh57V/Flora?node-id=8203-59903)
з адаптивною версткою за принципом mobile-first.

## Про проєкт

Односторінковий сайт квіткового магазину: hero-блок, розділ про майстерню,
слайдер найпопулярніших букетів, каталог букетів, відгуки клієнтів, контакти
та мобільне меню.

## Технології

- Семантичний HTML5
- CSS3: кастомні властивості (змінні), Flexbox, медіазапити (mobile-first, брейкпоінти 375/768/1440)
- modern-normalize
- SVG-спрайт для іконок
- Бібліотека анімацій [AOS](https://michalsnik.github.io/aos/)
- JavaScript для мобільного меню (клас `is-open`)
- Шрифти Google Fonts: Hanuman, Roboto

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

## Жива сторінка

Проєкт задеплоєно на GitHub Pages:
<https://sergekhoroshko.github.io/UMT-markup-practice_P1-KhoroshkoSV/>
