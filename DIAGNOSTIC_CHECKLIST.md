# Диагностический чек-лист для интеграции торгового бота

## Проблема: Данные не отображаются в админке

### ✅ Шаг 1: Проверка Backend

#### 1.1 Backend запущен?
```bash
# Перейдите в папку backend
cd backend/src/BotsForTrading.Api

# Запустите backend
dotnet run
```

**Ожидаемый результат:**
```
Now listening on: http://localhost:5000
```

#### 1.2 Проверка endpoint'ов
Откройте в браузере: http://localhost:5000/swagger

**Должны быть видны endpoints:**
- `POST /api/v1/botstate/{botId}/status`
- `POST /api/v1/botstate/{botId}/position`
- `GET /api/v1/botstate/{botId}`
- `GET /api/v1/botstate`

#### 1.3 Проверка логов backend
В консоли backend должны появляться логи при запросах:
```
[12:00:00 INF] HTTP GET /api/v1/botstate responded 200
```

---

### ✅ Шаг 2: Проверка файлов состояний

#### 2.1 Проверьте наличие тестовых файлов
```bash
ls backend/Data/BotStates/
```

**Должны быть файлы:**
- `test-bot-1.json` ✅
- `test-bot-2.json` ✅

#### 2.2 Проверьте содержимое файла
```bash
cat backend/Data/BotStates/test-bot-1.json
```

**Должен быть валидный JSON** с полями:
- `BotId`
- `Status`
- `Position`
- `LastUpdate`

---

### ✅ Шаг 3: Тест API вручную

#### 3.1 Тест без авторизации (должен работать)
```bash
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/botstate/test-bot-1/status" -Method Post -Body '{"IsRunning": true, "Status": "Running"}' -ContentType "application/json"
```

**Ожидаемый результат:**
```json
{ "message": "Status updated successfully" }
```

#### 3.2 Тест с авторизацией (для GET запросов)
```bash
# Получите токен через login
$token = "YOUR_JWT_TOKEN"

# Получить все состояния
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/botstate" -Method Get -Headers @{"Authorization"="Bearer $token"}
```

**Ожидаемый результат:**
Массив с объектами ботов

#### 3.3 Запустите тестовый скрипт
```powershell
.\test-api.ps1
```

---

### ✅ Шаг 4: Проверка Frontend

#### 4.1 Frontend запущен?
```bash
cd frontend
npm run dev
```

**Ожидаемый результат:**
```
Local: http://localhost:3000
```

#### 4.2 Проверка консоли браузера
1. Откройте http://localhost:3000
2. Нажмите F12 (DevTools)
3. Перейдите на вкладку Console

**Должны быть логи:**
```
[BotStateAPI] Fetching all bot states from: http://localhost:5000/api/v1/botstate
[BotStateAPI] All bot states received: [...]
```

**Если видите ошибки:**

**401 Unauthorized:**
- Проблема с авторизацией
- Проверьте, что вы залогинены
- Проверьте токен в localStorage

**404 Not Found:**
- Backend не запущен
- Неправильный URL в VITE_API_URL

**CORS Error:**
- Проверьте настройки CORS в backend
- В `appsettings.json` должен быть `http://localhost:3000`

---

### ✅ Шаг 5: Проверка переменных окружения

#### 5.1 Frontend .env файл
```bash
cat frontend/.env
```

**Должно быть:**
```
VITE_API_URL=http://localhost:5000
```

#### 5.2 Backend appsettings.json
```bash
cat backend/src/BotsForTrading.Api/appsettings.json
```

**CORS должен включать:**
```json
{
  "CORS": {
    "Origins": "http://localhost:3000"
  }
}
```

---

### ✅ Шаг 6: Проверка Network в браузере

1. F12 → вкладка Network
2. Обновите страницу /bots
3. Найдите запрос к `/api/v1/botstate`

**Проверьте:**
- ✅ **Status Code:** должен быть 200
- ✅ **Response:** должен быть массив с данными ботов
- ✅ **Headers:** должен быть `Authorization: Bearer ...`

**Если Status 401:**
```javascript
// В консоли браузера проверьте токен:
localStorage.getItem('token')

// Если null - нужно залогиниться
```

---

### ✅ Шаг 7: Проверка данных от торгового бота

#### 7.1 Бот отправляет данные?
В логах вашего торгового бота должно быть:
```
[BotReporter] Sending status to http://localhost:5000/api/v1/botstate/your-bot-id/status
[BotReporter] Status update successful
```

#### 7.2 Проверьте настройки бота
В `%APPDATA%\TradingBot\settings.json`:
```json
{
  "AdminUrl": "http://localhost:5000"
}
```

**Или переменная окружения:**
```cmd
echo %ADMIN_URL%
```

#### 7.3 Файл создается после отправки?
```bash
# После запуска торгового бота проверьте:
ls backend/Data/BotStates/your-bot-id.json
```

Если файл создался - **данные приходят!** ✅

---

## Быстрая диагностика

### Проверка 1: Backend работает?
```bash
curl http://localhost:5000/health
```
**Ответ:** `Healthy`

### Проверка 2: Endpoint доступен?
```bash
curl -X POST http://localhost:5000/api/v1/botstate/test/status -H "Content-Type: application/json" -d '{"IsRunning":true,"Status":"Running"}'
```
**Ответ:** `{"message":"Status updated successfully"}`

### Проверка 3: Frontend получает данные?
Открыть консоль браузера → должны быть логи `[BotStateAPI]`

### Проверка 4: Данные отображаются?
На странице /bots должны быть карточки `BotStateIndicator` под каждым ботом

---

## Решение частых проблем

### Проблема: 401 Unauthorized в консоли
**Решение:**
1. Залогиньтесь в админку
2. Проверьте токен: `localStorage.getItem('token')`
3. Если токен есть, проверьте срок действия

### Проблема: CORS Error
**Решение:**
1. Проверьте `appsettings.json` → `CORS:Origins`
2. Перезапустите backend
3. Очистите кэш браузера

### Проблема: Данные не обновляются
**Решение:**
1. Проверьте, что торговый бот отправляет данные каждые 5 секунд
2. Проверьте timestamp в файле `backend/Data/BotStates/{botId}.json`
3. Frontend обновляет данные каждые 5 секунд автоматически

### Проблема: Пустая страница /bots
**Решение:**
1. Проверьте консоль на ошибки
2. Проверьте что есть боты в БД (таблица TradingBots)
3. Попробуйте создать тестового бота через UI

---

## Следующие действия

После прохождения всех проверок:

1. ✅ Если все работает с тестовыми файлами → интеграция работает!
2. ✅ Запустите торговый бот с DLL
3. ✅ Проверьте что файл создается в `Data/BotStates/`
4. ✅ Обновите страницу /bots в админке
5. ✅ Должны увидеть real-time данные!

---

## Контакты для помощи

Если после всех проверок данные не отображаются:

1. Пришлите логи backend (консоль)
2. Пришлите логи frontend (консоль браузера F12)
3. Пришлите содержимое файла из `Data/BotStates/`
4. Пришлите скриншот Network вкладки в DevTools
