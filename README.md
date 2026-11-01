# Daily List

Простой список задач на React + TypeScript + Vite.

## Возможности

- добавление задачи через поле ввода и кнопку;
- переключение выполнено/не выполнено;
- удаление задач;
- фильтрация по статусу и дате;
- сохранение данных в localStorage;
- работа офлайн после production-сборки через service worker;
- демо-задачи на несколько ближайших дней при первом запуске;
- адаптивная вёрстка без UI-библиотеки.

## Запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:5173`.

## Проверки

```bash
npm run lint
npm run format:check
npm test
npm run test:e2e
npm run build
```

После `npm run build` service worker генерируется в `dist/sw.js`.
Для проверки offline-режима запустите `npm run preview`,
откройте приложение один раз онлайн, а затем отключите сеть и обновите страницу.

## Docker

```bash
docker compose up --build
```

Приложение будет доступно на `http://localhost:3000`.

## Time spent
Ориентировочное время выполнения: 30 минут, включая редизайн, календарное расширение, тесты и проверку качества кода.
