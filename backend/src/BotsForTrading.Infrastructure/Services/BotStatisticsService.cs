using BotsForTrading.Core.Entities;
using BotsForTrading.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BotsForTrading.Infrastructure.Services;

public class BotStatisticsService : IBotStatisticsService
{
    private readonly IApplicationDbContext _context;
    private readonly ITradeHistoryFileService _tradeHistoryFileService;
    private readonly ILogger<BotStatisticsService> _logger;

    public BotStatisticsService(
        IApplicationDbContext context,
        ITradeHistoryFileService tradeHistoryFileService,
        ILogger<BotStatisticsService> logger)
    {
        _context = context;
        _tradeHistoryFileService = tradeHistoryFileService;
        _logger = logger;
    }

    public async Task RecalculateStatisticsAsync(int botId)
    {
        try
        {
            var trades = await _tradeHistoryFileService.GetTradesByBotIdAsync(botId);
            var tradeList = trades.ToList();

            var statistics = await _context.BotStatistics
                .FirstOrDefaultAsync(s => s.BotId == botId);

            if (statistics == null)
            {
                statistics = new BotStatistics { BotId = botId };
                _context.BotStatistics.Add(statistics);
            }

            CalculateStatistics(statistics, tradeList);

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Statistics recalculated for bot {BotId}: TotalTrades={TotalTrades}, NetProfit={NetProfit}, WinRate={WinRate}%",
                botId, statistics.TotalTrades, statistics.NetProfit, statistics.WinRate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recalculating statistics for bot {BotId}", botId);
            throw;
        }
    }

    public async Task RecalculateAllStatisticsAsync()
    {
        var bots = await _context.TradingBots.ToListAsync();

        foreach (var bot in bots)
        {
            await RecalculateStatisticsAsync(bot.Id);
        }

        _logger.LogInformation("Statistics recalculated for all {BotCount} bots", bots.Count);
    }

    private void CalculateStatistics(BotStatistics statistics, List<TradeHistory> trades)
    {
        if (trades.Count == 0)
        {
            statistics.TotalTrades = 0;
            statistics.WinningTrades = 0;
            statistics.LosingTrades = 0;
            statistics.TotalProfit = 0;
            statistics.TotalLoss = 0;
            statistics.NetProfit = 0;
            statistics.WinRate = 0;
            statistics.AverageProfit = 0;
            statistics.AverageLoss = 0;
            statistics.MaxDrawdown = 0;
            statistics.UpdatedAt = DateTime.UtcNow;
            return;
        }

        var winningTrades = trades.Where(t => t.RealizedPnL > 0).ToList();
        var losingTrades = trades.Where(t => t.RealizedPnL < 0).ToList();

        statistics.TotalTrades = trades.Count;
        statistics.WinningTrades = winningTrades.Count;
        statistics.LosingTrades = losingTrades.Count;

        statistics.TotalProfit = winningTrades.Sum(t => t.RealizedPnL);
        statistics.TotalLoss = Math.Abs(losingTrades.Sum(t => t.RealizedPnL));
        statistics.NetProfit = trades.Sum(t => t.RealizedPnL);

        statistics.WinRate = trades.Count > 0
            ? Math.Round((decimal)winningTrades.Count / trades.Count * 100, 2)
            : 0;

        statistics.AverageProfit = winningTrades.Count > 0
            ? Math.Round(winningTrades.Average(t => t.RealizedPnL), 2)
            : 0;

        statistics.AverageLoss = losingTrades.Count > 0
            ? Math.Round(Math.Abs(losingTrades.Average(t => t.RealizedPnL)), 2)
            : 0;

        statistics.MaxDrawdown = CalculateMaxDrawdown(trades);
        statistics.UpdatedAt = DateTime.UtcNow;
    }

    private decimal CalculateMaxDrawdown(List<TradeHistory> trades)
    {
        if (trades.Count == 0) return 0;

        var orderedTrades = trades.OrderBy(t => t.ClosedAt).ToList();

        decimal peak = 0;
        decimal maxDrawdown = 0;
        decimal runningPnL = 0;

        foreach (var trade in orderedTrades)
        {
            runningPnL += trade.RealizedPnL;

            if (runningPnL > peak)
            {
                peak = runningPnL;
            }

            var drawdown = peak - runningPnL;
            if (drawdown > maxDrawdown)
            {
                maxDrawdown = drawdown;
            }
        }

        return Math.Round(maxDrawdown, 2);
    }
}
