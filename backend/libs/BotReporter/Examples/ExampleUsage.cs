using BotReporter;
using BotReporter.Models;

namespace BotReporter.Examples;

/// <summary>
/// Пример использования BotStateReporter в торговом боте
/// </summary>
public class ExampleTradingBot
{
    private BotStateReporter? _reporter;
    private bool _isRunning;
    private Random _random = new Random();

    public async Task RunAsync()
    {
        // Инициализация репортера
        _reporter = new BotStateReporter(
            apiUrl: "http://localhost:5000",
            botId: "example-bot-1"
        );

        Console.WriteLine("Starting trading bot...");

        // Сообщаем что бот запущен
        await _reporter.ReportBotStartedAsync(
            botName: "Example Trading Bot",
            exchange: "BitGet-M",
            account: "TestAccount"
        );
        _isRunning = true;

        try
        {
            // Симуляция работы бота
            await SimulateTradingAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            await _reporter.ReportBotErrorAsync();
        }
        finally
        {
            await _reporter.ReportBotStoppedAsync();
            _reporter.Dispose();
            Console.WriteLine("Bot stopped.");
        }
    }

    private async Task SimulateTradingAsync()
    {
        decimal currentPrice = 50000m;
        bool inPosition = false;
        decimal entryPrice = 0m;
        DateTime positionOpenedAt = DateTime.UtcNow;

        while (_isRunning)
        {
            // Симуляция изменения цены
            currentPrice += _random.Next(-100, 101);

            if (!inPosition && _random.Next(100) < 10) // 10% шанс открыть позицию
            {
                // Открываем позицию
                inPosition = true;
                entryPrice = currentPrice;
                positionOpenedAt = DateTime.UtcNow;

                Console.WriteLine($"Opening position at {currentPrice}");

                await _reporter.UpdatePositionAsync(new PositionInfo
                {
                    InPosition = true,
                    EntryPrice = entryPrice,
                    TakeProfit = entryPrice + 500,
                    StopLoss = entryPrice - 250,
                    PositionSize = 0.1m,
                    CurrentPrice = currentPrice,
                    UnrealizedPnL = 0m,
                    PositionSide = "Long"
                });
            }
            else if (inPosition)
            {
                // Обновляем позицию
                decimal pnl = (currentPrice - entryPrice) * 0.1m;

                Console.WriteLine($"Position update - Price: {currentPrice}, PnL: {pnl:F2}");

                await _reporter.UpdatePositionAsync(new PositionInfo
                {
                    InPosition = true,
                    EntryPrice = entryPrice,
                    TakeProfit = entryPrice + 500,
                    StopLoss = entryPrice - 250,
                    PositionSize = 0.1m,
                    CurrentPrice = currentPrice,
                    UnrealizedPnL = pnl,
                    PositionSide = "Long"
                });

                // Проверяем TP/SL или случайное закрытие
                if (currentPrice >= entryPrice + 500 ||
                    currentPrice <= entryPrice - 250 ||
                    _random.Next(100) < 5) // 5% шанс закрыть
                {
                    Console.WriteLine($"Closing position - Final PnL: {pnl:F2}");
                    inPosition = false;

                    // Сначала отправляем историю завершенного трейда
                    CompletedTrade completedTrade;

                    if (pnl > 0)
                    {
                        // Прибыльный трейд
                        completedTrade = CompletedTrade.CreateProfit(
                            tradingPair: "BTCUSDT",
                            positionSide: "Long",
                            entryPrice: entryPrice,
                            exitPrice: currentPrice,
                            positionSize: 0.1m,
                            realizedPnL: pnl,
                            openedAt: positionOpenedAt
                        );
                    }
                    else
                    {
                        // Убыточный трейд
                        completedTrade = CompletedTrade.CreateLoss(
                            tradingPair: "BTCUSDT",
                            positionSide: "Long",
                            entryPrice: entryPrice,
                            exitPrice: currentPrice,
                            positionSize: 0.1m,
                            realizedPnL: pnl,
                            openedAt: positionOpenedAt
                        );
                    }

                    await _reporter.ReportCompletedTradeAsync(completedTrade);

                    // Затем очищаем текущую позицию
                    await _reporter.ReportNoPositionAsync();
                }
            }

            await Task.Delay(1000); // Обновляем каждую секунду
        }
    }

    public void Stop()
    {
        _isRunning = false;
    }
}

// Пример запуска
public class Program
{
    public static async Task Main(string[] args)
    {
        var bot = new ExampleTradingBot();

        // Запускаем бота в фоне
        var botTask = bot.RunAsync();

        Console.WriteLine("Press any key to stop the bot...");
        Console.ReadKey();

        bot.Stop();
        await botTask;
    }
}
