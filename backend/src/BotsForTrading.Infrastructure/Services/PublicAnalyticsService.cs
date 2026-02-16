using BotsForTrading.Core.Interfaces;
using BotsForTrading.Shared.DTOs.Analytics;

namespace BotsForTrading.Infrastructure.Services;

public class PublicAnalyticsService : IPublicAnalyticsService
{
    private readonly ITradeHistoryFileService _tradeHistoryFileService;
    private readonly IBotStateService _botStateService;

    public PublicAnalyticsService(
        ITradeHistoryFileService tradeHistoryFileService,
        IBotStateService botStateService)
    {
        _tradeHistoryFileService = tradeHistoryFileService;
        _botStateService = botStateService;
    }

    public async Task<PublicAnalyticsDto> GetPublicAnalyticsAsync(string period)
    {
        var allTrades = await _tradeHistoryFileService.GetAllTradesAsync();
        var botStates = await _botStateService.GetAllBotStatesAsync();

        // Filter by period
        var filteredTrades = period switch
        {
            "7" => allTrades.Where(t => t.ClosedAt >= DateTime.UtcNow.AddDays(-7)).ToList(),
            "30" => allTrades.Where(t => t.ClosedAt >= DateTime.UtcNow.AddDays(-30)).ToList(),
            "90" => allTrades.Where(t => t.ClosedAt >= DateTime.UtcNow.AddDays(-90)).ToList(),
            _ => allTrades
        };

        var totalTrades = filteredTrades.Count;
        var winningTrades = filteredTrades.Count(t => t.Status == "Success");
        var totalProfit = filteredTrades.Sum(t => t.RealizedPnL);
        var winRate = totalTrades > 0
            ? Math.Round((decimal)winningTrades / totalTrades * 100m, 1)
            : 0m;
        var activeBots = botStates.Count(s => s.Status?.IsRunning == true);

        // Build cumulative PnL chart data
        var sortedTrades = filteredTrades.OrderBy(t => t.ClosedAt).ToList();
        var chartData = new List<ChartPointDto>();
        decimal cumulativePnL = 0m;

        foreach (var trade in sortedTrades)
        {
            cumulativePnL += trade.RealizedPnL;
            chartData.Add(new ChartPointDto
            {
                Date = trade.ClosedAt.ToString("dd.MM"),
                FullDate = trade.ClosedAt.ToString("dd.MM.yyyy"),
                Pnl = Math.Round(cumulativePnL, 2)
            });
        }

        return new PublicAnalyticsDto
        {
            TotalProfit = Math.Round(totalProfit, 2),
            TotalTrades = totalTrades,
            WinningTrades = winningTrades,
            WinRate = winRate,
            ActiveBots = activeBots,
            TotalBots = botStates.Count,
            Period = period,
            ChartData = chartData
        };
    }
}
