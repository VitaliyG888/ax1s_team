# SEO-отчёт — AX1S_TEAM

## Индексация

- Весь смысл в DOM до загрузки canvas: H1, CTA связи, три условия, манифест, кейсы, практики, FAQ, контакты.
- `<canvas>` — progressive enhancement (`next/dynamic`, `ssr: false`).
- `<noscript>` дублирует позиционирование, кейсы, практики и контакты.
- `robots.ts` allow `/`, sitemap: `/` и `/privacy`.
- Canonical, Open Graph, Twitter Card, `metadataBase`.

## Семантика

- Один H1: «Форма врёт. Бренд остаётся.»
- H2 на первом экране: «Почему AX1S_TEAM для иммерсивного 3D-сайта» + H2 секций.
- H3: три условия (WebGL несёт бренд / Поиск видит текст / Одна камера, одна смета), кейсы, практики, FAQ.
- Alt кейсов описывают 3D-кадр и бренд AX1S_TEAM.
- Keywords: 3D-разработка, иммерсивные сайты, creative development, WebGL портфолио.

## schema.org (`JsonLd`)

- `Organization` name/legalName/copyrightHolder = AX1S_TEAM
- `Person` author / creative director
- `ProfessionalService` + serviceType из практик
- `CreativeWork` на каждый кейс (author, copyrightHolder, image, year)
- `FAQPage` из `data/faq`
- `ItemList` — три условия первого экрана
- `WebSite` / `WebPage`

Проверка: вставить JSON-LD в https://validator.schema.org/ — граф без ошибок типов. Поиск не видит canvas, видит текстовый дубль.

## Core Web Vitals (бюджет архитектуры)

| Метрика | Бюджет | Как заложено |
| --- | --- | --- |
| LCP | < 2.5 s | LCP-кандидат — H1/текст в DOM; 3D после пейнта; poster CSS, не тяжёлый JPG |
| INP | < 200 ms | hitbox в DOM; GSAP quickTo; нет блокирующих шейдеров на старте; dpr cap 1.5 |
| CLS | < 0.1 | min-h-dvh героя; шрифты `display: swap`; размеры image fill + aspect-ratio |

Lighthouse в этой среде не запускался против продакшен-URL (локальный dev). Повторить на проде: Lighthouse mobile, WebPageTest, Search Console URL Inspection.

## Конкурентная семантика (заложена в копирайт)

H1/H2 держат запросы «иммерсивные сайты», «WebGL», «3D-разработка», «creative development» без переспама. Кейсы — задача / механика / метрика. Услуги — через результат.
