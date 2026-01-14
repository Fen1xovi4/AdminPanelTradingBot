# Руководство по интеграции торгового бота с админ-панелью

## Что реализовано

### ✅ Backend API
- Endpoints для приема данных от торговых ботов
- Файловое хранилище состояний ботов (JSON)
- Endpoints для получения данных во frontend

### ✅ DLL Библиотека
- **Расположение**: `backend/libs/BotReporter/bin/Release/net10.0/BotReporter.dll`
- Простой API для отправки данных в админку
- Автоматическая отправка статуса и позиций

### ✅ Frontend
- Real-time отображение состояния ботов
- Автообновление каждые 5 секунд
- Индикатор позиции с ценами входа, TP и SL
- Отображение нереализованного P&L

## Быстрый старт

### 1. Запуск Backend

```bash
cd backend/src/BotsForTrading.Api
dotnet run
```

Backend будет доступен на `http://localhost:5000`

### 2. Запуск Frontend

```bash
cd frontend
npm run dev
```

Frontend будет доступен на `http://localhost:3000`

### 3. Использование в торговом боте

#### Добавьте DLL в ваш проект:

1. Скопируйте `BotReporter.dll` из `backend/libs/BotReporter/bin/Release/net10.0/`
2. Добавьте ссылку на DLL в ваш проект

#### Код для интеграции:

```csharp
using BotReporter;
using BotReporter.Models;

public class YourTradingBot
{
    private BotStateReporter _reporter;

    public async Task StartAsync()
    {
        // Инициализация репортера
        _reporter = new BotStateReporter(
            apiUrl: "http://localhost:5000",
            botId: "your-bot-id"  // Используйте уникальный ID для каждого бота
        );

        // Сообщаем что бот запущен
        await _reporter.ReportBotStartedAsync();

        try
        {
            while (IsRunning)
            {
                // Ваша торговая логика...

                if (HasOpenPosition)
                {
                    // Обновляем позицию каждые 5 секунд
                    await _reporter.UpdatePositionAsync(new PositionInfo
                    {
                        InPosition = true,
                        EntryPrice = position.EntryPrice,
                        TakeProfit = position.TakeProfit,
                        StopLoss = position.StopLoss,
                        PositionSize = position.Size,
                        CurrentPrice = GetCurrentPrice(),
                        UnrealizedPnL = CalculatePnL(),
                        PositionSide = position.IsLong ? "Long" : "Short"
                    });
                }
                else
                {
                    // Сообщаем что позиции нет
                    await _reporter.ReportNoPositionAsync();
                }

                await Task.Delay(5000); // Обновляем каждые 5 секунд
            }

            // При остановке бота
            await _reporter.ReportBotStoppedAsync();
        }
        catch (Exception ex)
        {
            // При ошибке
            await _reporter.ReportBotErrorAsync();
        }
        finally
        {
            _reporter?.Dispose();
        }
    }
}
```

## Что отправляется в админку

### При запуске/остановке бота:
```
POST /api/v1/botstate/{botId}/status
{
  "IsRunning": true,
  "Status": "Running"  // или "Stopped", "Error"
}
```

### Каждые 5 секунд (если бот в позиции):
```
POST /api/v1/botstate/{botId}/position
{
  "InPosition": true,
  "EntryPrice": 50000.0,
  "TakeProfit": 51000.0,
  "StopLoss": 49500.0,
  "PositionSize": 0.1,
  "CurrentPrice": 50100.0,
  "UnrealizedPnL": 10.0,
  "PositionSide": "Long"
}
```

## Что отображается в админке

Для каждого бота показывается:

1. **Статус бота**
   - 🟢 Running (зеленый индикатор с анимацией)
   - ⚪ Stopped (серый индикатор)
   - 🔴 Error (красный индикатор)

2. **Информация о позиции**
   - Тип позиции (Long/Short) или "No Position"
   - Цена входа
   - Текущая цена
   - Take Profit (зеленым)
   - Stop Loss (красным)
   - Нереализованный P&L с индикатором роста/падения

3. **Время последнего обновления**

## Структура файлового хранилища

Состояния ботов сохраняются в:
```
backend/Data/BotStates/{botId}.json
```

Пример файла:
```json
{
  "BotId": "my-bot-1",
  "BotName": "my-bot-1",
  "Exchange": "",
  "Account": "",
  "Status": {
    "BotId": "my-bot-1",
    "IsRunning": true,
    "Status": "Running",
    "Timestamp": "2026-01-03T12:00:00Z"
  },
  "Position": {
    "BotId": "my-bot-1",
    "InPosition": true,
    "EntryPrice": 50000.0,
    "TakeProfit": 51000.0,
    "StopLoss": 49500.0,
    "PositionSize": 0.1,
    "CurrentPrice": 50100.0,
    "UnrealizedPnL": 10.0,
    "PositionSide": "Long",
    "Timestamp": "2026-01-03T12:00:05Z"
  },
  "LastUpdate": "2026-01-03T12:00:05Z"
}
```

## Тестирование

### Тестовый пример бота

В `backend/libs/BotReporter/Examples/ExampleUsage.cs` находится пример торгового бота с симуляцией торговли.

### Ручное тестирование через curl

```bash
# Обновить статус
curl -X POST http://localhost:5000/api/v1/botstate/test-bot-1/status \
  -H "Content-Type: application/json" \
  -d '{"IsRunning": true, "Status": "Running", "Timestamp": "2026-01-03T12:00:00Z"}'

# Обновить позицию
curl -X POST http://localhost:5000/api/v1/botstate/test-bot-1/position \
  -H "Content-Type: application/json" \
  -d '{
    "InPosition": true,
    "EntryPrice": 50000,
    "TakeProfit": 51000,
    "StopLoss": 49500,
    "PositionSize": 0.1,
    "CurrentPrice": 50100,
    "UnrealizedPnL": 10,
    "PositionSide": "Long",
    "Timestamp": "2026-01-03T12:00:00Z"
  }'
```

## Troubleshooting

### Бот не отображается в админке
1. Убедитесь что backend запущен на `http://localhost:5000`
2. Проверьте что bot отправляет данные (логи в консоли бота)
3. Проверьте файл `backend/Data/BotStates/{botId}.json` - он должен создаться

### Данные не обновляются
1. Убедитесь что бот отправляет обновления каждые 5 секунд
2. Проверьте консоль браузера на ошибки
3. Frontend автоматически обновляется каждые 5 секунд

### Ошибка CORS
Убедитесь что в `backend/src/BotsForTrading.Api/appsettings.json` указан правильный URL frontend:
```json
{
  "CORS": {
    "Origins": "http://localhost:3000"
  }
}
```

## Следующие шаги

- [ ] Добавить SignalR для мгновенных обновлений без polling
- [ ] Добавить историю сделок
- [ ] Добавить графики P&L
- [ ] Добавить уведомления о важных событиях
- [ ] Перенести на реальную БД (PostgreSQL)
