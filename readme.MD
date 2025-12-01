# Safari Phaser Project

## Установка и запуск

### Клонирование

```bash
git clone https://github.com/Logycom-KZ/safari-phaser.git
cd safari-phaser
```

### Установка

```bash
npm install
```

### Запуск dev сервера

```bash
npm run dev
```

### Собираем билд

```bash
npm run build
```

---

## Форматирование (Prettier)

- Запятая после последнего элемента - только для объектов, массивов и аргументов функций (trailingComma: "es5");

- Отступы в JavaScript/TypeScript - 2 пробела (tabWidth: 2);

- Для HTML, CSS и SASS - 4 пробела;

- В конце строки ставим точку с запятой (semi: true);

- Строки - одинарные кавычки (singleQuote: true).

## Правила для именования и прочее

### Именование файлов и директорий

- **Файлы**:

  - `PascalCase` — для файлов с классами и сценами (пример: BootScene.ts)
  - `camelCase` — для вспомогательных модулей (пример: eventBus.ts, helpers.ts)

- **Директории**: `kebab-case` (пример: core, network, scenes, services, ui, types)

- **Компоненты UI**:

  - Название компонента и директории идентичны (`Button/Button.tsx`)

- **Типы и интерфейсы**:

  - Интерфейсы с префиксом `I` (пример: IPlayer, INetworkEvent)
  - Типы с префиксом `T` (пример: TSceneConfig)

### Именование переменных и функций

- **Переменные**: `camelCase` (пример: playerScore, socketService)
- **Константы**: `UPPER_SNAKE_CASE` (пример: MAX_LIVES, API_ENDPOINT)
- **Функции**: `camelCase`, начинаются с глагола (пример: loadAssets(), connectSocket())
- **Классы**: `PascalCase` (например, GameController, EventBus)

### Пространства имён и модули

Используем файл `index.ts` для реэкспорта сущностей, чтобы упрощать импорты:

```typescript
import { GameController } from '../core';
```

Чёткие неймспейсы по папкам:

- core/
- network/
- scenes/
- services/
- ui/
- types/

---

## Git Flow

### Коммиты

Используем формат:

```
<тип>(<область>): <описание>
```

Если изменения критические, используем ! знак для пометки:

```
<тип>!(<область>): <описание>
```

Пример:

- `feat(scenes): Создал сцену SuperMario`
- `fix(network): Исправил ошибку в сокете при коннекте`
- `docs(readme): Добавил описание`

### Ветки

Используем следующую структуру веток:

- `feature/<описание>` для фич
- `bugfix/<описание>` для фиксов
- `hotfix/<описание>` для срочных фиксов

### Пример для веток

1. Создаем ветку из `dev`:

```bash
git checkout -b feature/new-game-scene
```

2. Коммитим изменения:

```bash
git commit -m "feat(scenes): Создал сцену SuperMario"
```

3. Пушим в гит:

```bash
git push origin feature/new-game-scene
```

4. Открываем PR для ревью

---
