# RemoteSearchWork 🌐💼

Современная платформа для поиска и агрегации IT-вакансий и вакансий курьеров с автоматическим обновлением данных каждые 10 минут, прозрачным выводом ошибок (без моковых данных), поддержкой ленивой подгрузки (infinite scroll) и чистой модульной архитектурой.

---

## 🎯 Охват и тематика

### 1. Регионы и страны:
- **Сербия 🇷🇸**: Отдельная страница IT-вакансий (Белград, Нови-Сад, Ниш, удаленно) + вакансии курьеров.
- **Армения 🇦🇲**: Отдельная страница IT-вакансий (Ереван, Гюмри, удаленно) + вакансии курьеров.
- **Удаленная работа (Европа & США & СНГ) 🌍**:
  - Все страны Европы (Германия, Великобритания, Нидерланды, Польша, Франция, Испания и др.).
  - США (United States).
  - Страны СНГ: строго **Грузия, Армения, Узбекистан** (по запросу).
  - Интерактивный фильтр стран на общей странице.
- **Вакансии курьеров 🚴**:
  - Отдельная страница для Сербии (*Poslovi Infostud / dostavljač / kurir*) и Армении (*Staff.am / delivery / courier*).

### 2. Специализации (IT):
- Frontend Developer
- JS Developer
- Web Developer
- Fullstack Developer
- Node.js Developer
- Typescript Developer
- React Developer
- Vue Developer
*(Архитектура позволяет легко подключать любые другие категории и специализации: Backend, QA, DevOps и т.д.)*

---

## 🛠 Технологический стек

### Frontend:
- **Vue 3** (Composition API, `<script setup lang="ts">`)
- **Vite** — быстрая сборка и HMR
- **TypeScript** — строгая типизация
- **FSD (Feature-Sliced Design)**:
  - `app/` — роутинг, глобальные стили, корневой компонент
  - `pages/` — страницы: Сербия, Армения, Global Remote, Курьеры, 404
  - `widgets/` — Header с таймером 10 минут, FilterBar, VacancyList, ErrorBanner, Footer
  - `features/` — бесконечный скролл (IntersectionObserver), таймер автосинхронизации
  - `entities/` — карточка вакансии, модель вакансии
  - `shared/` — UI-компоненты (BaseButton, BaseBadge, BaseInput, BaseSelect, BaseSpinner), API-клиент
- **SCSS + БЭМ-методология** (`.block__element--modifier`)
- **Tailwind CSS** — утилиты верстки и сетки
- **Stylelint + ESLint + vue-tsc**

### Backend:
- **Node.js 20+**
- **Fastify** — высокопроизводительный HTTP-фреймворк
- **TypeScript**
- **Модульный движок скрапинга**:
  - `InfostudScraper` (Сербия IT)
  - `StaffAmScraper` (Армения IT)
  - `RemotiveScraper` (Европа и США Remote)
  - `WeWorkRemotelyScraper` (Global Remote)
  - `HabrCareerScraper` (СНГ: Грузия, Армения, Узбекистан)
  - `CourierScraper` (Курьеры: Сербия и Армения)
- **Кэширование** (TTL 10 минут) и автообновление через фоновый планировщик (`node-cron`)
- **Честный вывод ошибок**: при сбоях парсинга система не генерирует фейковые/моковые данные, а возвращает и выводит на клиенте реальные диагностические ошибки с возможностью перезапуска.

### DevOps:
- **Docker** & **Docker Compose** (многоэтапная сборка для бэкенда и Nginx-контейнер для фронтенда)
- **GitHub Actions CI/CD** (проверка ESLint, Stylelint, `vue-tsc`, сборка и выкатка)
- **Netlify** — хостинг фронтенда
- **Render.com** — хостинг бэкенда

---

## 📁 Структура проекта

```
remote-search-work/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Проверка линтеров, сборка
│       └── deploy.yml             # Деплой на Netlify и Render
├── backend/
│   ├── src/
│   │   ├── config/                # env.ts, constants.ts
│   │   ├── modules/vacancies/     # scrapers/, service, controller, routes, types
│   │   ├── jobs/                  # scheduler.ts (10-минутный cron)
│   │   ├── server.ts              # Конфигурация Fastify
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                   # Router, styles (main.scss)
│   │   ├── pages/                 # SerbiaPage, ArmeniaPage, GlobalRemotePage, CourierPage
│   │   ├── widgets/               # Header, FilterBar, VacancyList, ErrorBanner, Footer
│   │   ├── features/              # infinite-scroll, sync-timer
│   │   ├── entities/              # VacancyCard, types
│   │   └── shared/                # Base UI kit, API клиент, SCSS переменные/миксины
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── netlify.toml
│   ├── package.json
│   ├── vite.config.ts
│   └── .stylelintrc.json
├── docker-compose.yml
├── render.yaml                    # Blueprint спецификация для Render.com
├── netlify.toml
└── README.md
```

---

## ⚙️ Переменные окружения (.env)

Файлы `.env` находятся в `.gitignore` и **никогда не коммитятся**.

### Шаблоны:
- Корневой: [`.env.example`](./.env.example)
- Backend: [`backend/.env.example`](./backend/.env.example)
- Frontend: [`frontend/.env.example`](./frontend/.env.example)

### Переменные:
| Переменная | Окружение | Назначение | Значение по умолчанию |
|---|---|---|---|
| `PORT` | Backend | Порт Fastify | `4000` (локально) / `10000` (Render) |
| `NODE_ENV` | Backend | Режим окружения | `development` / `production` |
| `CORS_ORIGIN` | Backend | Разрешенные CORS-домены | `http://localhost:3000,http://localhost:5173` |
| `SCRAPER_INTERVAL_MINUTES` | Backend | Интервал автопарсинга | `10` |
| `CACHE_TTL_SECONDS` | Backend | Время жизни кэша | `600` (10 минут) |
| `VITE_API_BASE_URL` | Frontend | Адрес бэкенда | `http://localhost:4000` |

### Секреты для GitHub Actions (Settings -> Secrets & Variables -> Actions):
- `VITE_API_BASE_URL` — публичный URL бэкенда на Render (например, `https://remote-search-work-backend.onrender.com`)
- `NETLIFY_AUTH_TOKEN` — персональный токен доступа Netlify
- `NETLIFY_SITE_ID` — ID сайта в Netlify
- `RENDER_DEPLOY_HOOK_URL` — Deploy Hook URL для перезапуска бэкенда на Render

---

## 🚀 Локальный запуск

### Вариант 1: Через Docker Compose (рекомендуется)
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Healthcheck: `http://localhost:4000/health`

### Вариант 2: Локально через pnpm
1. Установка зависимостей:
```bash
pnpm install
```

2. Запуск в режиме разработки:
```bash
pnpm run dev
```

3. Проверка качества кода:
```bash
# Проверка скриптов и типов
pnpm run lint
pnpm run typecheck

# Проверка стилей SCSS/BEM
pnpm run lint:frontend:style

# Сборка проектов
pnpm run build
```

---

## 🚢 Деплой

### 1. Бэкенд на Render.com
1. Авторизуйтесь на [render.com](https://render.com).
2. Выберите **Blueprints** -> **New Blueprint Instance**.
3. Подключите ваш GitHub-репозиторий `remote-search-work`.
4. Render автоматически прочитает файл [`render.yaml`](./render.yaml) и развернет сервис.
5. Скопируйте полученный URL (например `https://remote-search-work-backend.onrender.com`).

### 2. Фронтенд на Netlify
1. Авторизуйтесь на [netlify.com](https://netlify.com) через ваш GitHub-аккаунт.
2. Нажмите **Add new site** -> **Import an existing project** -> выберите репозиторий `remote-search-work`.
3. Настройки сборки подставятся автоматически из [`netlify.toml`](./netlify.toml):
   - Base directory: `frontend`
   - Build command: `pnpm run build`
   - Publish directory: `frontend/dist`
4. В разделе **Environment variables** добавьте:
   - `VITE_API_BASE_URL` = `https://remote-search-work-backend.onrender.com`
5. Нажмите **Deploy Site**.
