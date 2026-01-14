# Trade History - История торговли

## Описание

Функционал истории торговли позволяет сохранять и визуализировать завершенные трейды (позиции) в админ-панели.

## Как это работает

### Статусы трейдов

Каждый завершенный трейд помечается одним из трех статусов:

- **Success (зеленый квадратик)** - Сделка закрылась в прибыль
- **Loss (оранжевый квадратик)** - Сделка закрылась в убыток
- **Error (красный квадратик)** - Произошла ошибка при закрытии позиции (не отправили ордер, позиция пропала на бирже и т.д.)

### Визуализация

В админ-панели на странице детального просмотра бота (Bot Detail Page) в разделе "Trade History" отображаются цветные квадратики, представляющие историю завершенных позиций. При наведении на квадратик показывается детальная информация о трейде.

## Использование в боте

### 1. Установка BotReporter

Добавьте ссылку на библиотеку BotReporter в ваш проект:

```xml
<ItemGroup>
  <ProjectReference Include="..\..\backend\libs\BotReporter\BotReporter.csproj" />
</ItemGroup>
```

### 2. Инициализация репортера

```csharp
using BotReporter;
using BotReporter.Models;

var reporter = new BotStateReporter(
    apiUrl: "http://localhost:5000",
    botId: "your-bot-id"
);
```

### 3. Отправка истории трейдов

#### Прибыльный трейд

```csharp
var trade = CompletedTrade.CreateProfit(
    tradingPair: "BTCUSDT",
    positionSide: "Long",
    entryPrice: 50000m,
    exitPrice: 51000m,
    positionSize: 0.1m,
    realizedPnL: 100m,
    openedAt: positionOpenTime
);

await reporter.ReportCompletedTradeAsync(trade);
```

#### Убыточный трейд

```csharp
var trade = CompletedTrade.CreateLoss(
    tradingPair: "BTCUSDT",
    positionSide: "Short",
    entryPrice: 50000m,
    exitPrice: 50500m,
    positionSize: 0.1m,
    realizedPnL: -50m,
    openedAt: positionOpenTime
);

await reporter.ReportCompletedTradeAsync(trade);
```

#### Ошибка при закрытии позиции

```csharp
var trade = CompletedTrade.CreateError(
    tradingPair: "BTCUSDT",
    positionSide: "Long",
    entryPrice: 50000m,
    positionSize: 0.1m,
    openedAt: positionOpenTime,
    errorMessage: "Failed to send close order: API timeout"
);

await reporter.ReportCompletedTradeAsync(trade);
```

### 4. Полный пример

```csharp
public async Task CloseLongPositionAsync()
{
    decimal entryPrice = 50000m;
    decimal exitPrice = 51000m;
    decimal positionSize = 0.1m;
    DateTime openedAt = _positionOpenTime;

    try
    {
        // Пытаемся закрыть позицию
        var closeResult = await exchange.ClosePositionAsync();

        if (closeResult.Success)
        {
            decimal pnl = (exitPrice - entryPrice) * positionSize;

            // Отправляем историю успешного трейда
            var trade = pnl > 0
                ? CompletedTrade.CreateProfit(
                    tradingPair: "BTCUSDT",
                    positionSide: "Long",
                    entryPrice: entryPrice,
                    exitPrice: exitPrice,
                    positionSize: positionSize,
                    realizedPnL: pnl,
                    openedAt: openedAt)
                : CompletedTrade.CreateLoss(
                    tradingPair: "BTCUSDT",
                    positionSide: "Long",
                    entryPrice: entryPrice,
                    exitPrice: exitPrice,
                    positionSize: positionSize,
                    realizedPnL: pnl,
                    openedAt: openedAt);

            await reporter.ReportCompletedTradeAsync(trade);
        }
        else
        {
            // Не удалось закрыть позицию - отправляем ошибку
            var errorTrade = CompletedTrade.CreateError(
                tradingPair: "BTCUSDT",
                positionSide: "Long",
                entryPrice: entryPrice,
                positionSize: positionSize,
                openedAt: openedAt,
                errorMessage: $"Failed to close: {closeResult.Error}"
            );

            await reporter.ReportCompletedTradeAsync(errorTrade);
        }
    }
    catch (Exception ex)
    {
        // Произошла ошибка - отправляем ошибку
        var errorTrade = CompletedTrade.CreateError(
            tradingPair: "BTCUSDT",
            positionSide: "Long",
            entryPrice: entryPrice,
            positionSize: positionSize,
            openedAt: openedAt,
            errorMessage: $"Exception: {ex.Message}"
        );

        await reporter.ReportCompletedTradeAsync(errorTrade);
    }
    finally
    {
        // Очищаем текущую позицию в real-time статусе
        await reporter.ReportNoPositionAsync();
    }
}
```

## API Endpoints

### GET /api/v1/tradehistory/bot/{botId}
Получить историю трейдов для конкретного бота

**Response:**
```json
[
  {
    "id": 1,
    "botId": 1,
    "tradingPair": "BTCUSDT",
    "positionSide": "Long",
    "entryPrice": 50000,
    "exitPrice": 51000,
    "positionSize": 0.1,
    "realizedPnL": 100,
    "status": "Success",
    "errorMessage": null,
    "openedAt": "2024-01-01T10:00:00Z",
    "closedAt": "2024-01-01T11:00:00Z"
  }
]
```

### POST /api/v1/tradehistory/{externalBotId}
Создать запись в истории трейдов (используется ботами)

**Request:**
```json
{
  "tradingPair": "BTCUSDT",
  "positionSide": "Long",
  "entryPrice": 50000,
  "exitPrice": 51000,
  "positionSize": 0.1,
  "realizedPnL": 100,
  "status": "Success",
  "errorMessage": null,
  "openedAt": "2024-01-01T10:00:00Z",
  "closedAt": "2024-01-01T11:00:00Z"
}
```

## База данных

### Создание миграции

После остановки приложения создайте миграцию:

```bash
cd backend/src/BotsForTrading.Infrastructure
dotnet ef migrations add AddTradeHistory --startup-project ../BotsForTrading.Api
dotnet ef database update --startup-project ../BotsForTrading.Api
```

### Структура таблицы TradeHistories

- `Id` - Уникальный идентификатор
- `BotId` - ID бота
- `TradingPair` - Торговая пара
- `PositionSide` - Сторона позиции (Long/Short)
- `EntryPrice` - Цена входа
- `ExitPrice` - Цена выхода
- `PositionSize` - Размер позиции в USD
- `RealizedPnL` - Реализованная прибыль/убыток
- `Status` - Статус (Success/Loss/Error)
- `ErrorMessage` - Сообщение об ошибке (опционально)
- `OpenedAt` - Время открытия позиции
- `ClosedAt` - Время закрытия позиции

## Примечания

1. **Когда отправлять историю:** Отправляйте историю трейда сразу после закрытия позиции
2. **Разница между Success и Loss:** Success - когда PnL > 0, Loss - когда PnL < 0
3. **Когда использовать Error:** Используйте Error когда не удалось корректно закрыть позицию (ошибка API, позиция пропала и т.д.)
4. **Real-time vs History:** Real-time статус (UpdatePositionAsync) показывает текущую позицию, History (ReportCompletedTradeAsync) сохраняет завершенные трейды
