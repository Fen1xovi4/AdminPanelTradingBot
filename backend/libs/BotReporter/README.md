# BotReporter DLL

DLL библиотека для отправки состояния торгового робота в админ-панель.

## Установка

1. Скомпилировать проект: `dotnet build -c Release`
2. Добавить `BotReporter.dll` в ваш проект торгового робота

## Использование

```csharp
using BotReporter;
using BotReporter.Models;

// Инициализация в вашем торговом роботе
var reporter = new BotStateReporter(
    apiUrl: "http://localhost:5000",  // URL вашего backend API
    botId: "my-bot-1"                 // Уникальный ID бота
);

// При запуске бота
await reporter.ReportBotStartedAsync();

// При открытии позиции
await reporter.UpdatePositionAsync(new PositionInfo
{
    InPosition = true,
    EntryPrice = 50000m,
    TakeProfit = 51000m,
    StopLoss = 49500m,
    PositionSize = 0.1m,
    CurrentPrice = 50100m,
    UnrealizedPnL = 10m,
    PositionSide = "Long"
});

// Обновление позиции (например, каждую секунду/минуту)
await reporter.UpdatePositionAsync(new PositionInfo
{
    InPosition = true,
    EntryPrice = 50000m,
    TakeProfit = 51000m,
    StopLoss = 49500m,
    PositionSize = 0.1m,
    CurrentPrice = 50200m,  // Обновленная текущая цена
    UnrealizedPnL = 20m,    // Обновленный P&L
    PositionSide = "Long"
});

// При закрытии позиции
await reporter.ReportNoPositionAsync();

// При остановке бота
await reporter.ReportBotStoppedAsync();

// При ошибке
await reporter.ReportBotErrorAsync();

// Не забудьте освободить ресурсы
reporter.Dispose();
```

## Полный пример

```csharp
public class MyTradingBot
{
    private BotStateReporter _reporter;

    public async Task StartAsync()
    {
        _reporter = new BotStateReporter("http://localhost:5000", "my-bot-1");

        // Сообщаем что бот запущен
        await _reporter.ReportBotStartedAsync();

        try
        {
            while (IsRunning)
            {
                // Ваша торговая логика...

                if (HasPosition)
                {
                    // Обновляем позицию
                    await _reporter.UpdatePositionAsync(new PositionInfo
                    {
                        InPosition = true,
                        EntryPrice = currentPosition.EntryPrice,
                        TakeProfit = currentPosition.TakeProfit,
                        StopLoss = currentPosition.StopLoss,
                        PositionSize = currentPosition.Size,
                        CurrentPrice = currentMarketPrice,
                        UnrealizedPnL = CalculatePnL(),
                        PositionSide = currentPosition.Side
                    });
                }

                await Task.Delay(1000); // Обновляем каждую секунду
            }

            await _reporter.ReportBotStoppedAsync();
        }
        catch (Exception ex)
        {
            await _reporter.ReportBotErrorAsync();
            throw;
        }
        finally
        {
            _reporter?.Dispose();
        }
    }
}
```

## API Endpoints

Библиотека автоматически отправляет данные на следующие endpoints:

- `POST /api/v1/botstate/{botId}/status` - Обновление статуса бота
- `POST /api/v1/botstate/{botId}/position` - Обновление позиции

## Структура данных

### BotStatus
- `IsRunning` (bool) - Работает ли бот
- `Status` (string) - "Running", "Stopped", "Error"

### PositionInfo
- `InPosition` (bool) - В позиции или нет
- `EntryPrice` (decimal) - Цена входа
- `TakeProfit` (decimal) - Цена тейк-профита
- `StopLoss` (decimal) - Цена стоп-лосса
- `PositionSize` (decimal) - Размер позиции
- `CurrentPrice` (decimal) - Текущая цена
- `UnrealizedPnL` (decimal) - Нереализованная прибыль/убыток
- `PositionSide` (string) - "Long" или "Short"
