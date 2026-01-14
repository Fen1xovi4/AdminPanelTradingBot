using BotsForTrading.Core.Entities;

namespace BotsForTrading.Core.Interfaces;

/// <summary>
/// Service for managing trade history in file storage
/// </summary>
public interface ITradeHistoryFileService
{
    /// <summary>
    /// Save a completed trade to file
    /// </summary>
    Task SaveTradeAsync(TradeHistory trade);

    /// <summary>
    /// Get all trades for a specific bot
    /// </summary>
    Task<List<TradeHistory>> GetTradesByBotIdAsync(int botId);

    /// <summary>
    /// Get all trades for a specific bot by external bot ID
    /// </summary>
    Task<List<TradeHistory>> GetTradesByExternalBotIdAsync(string externalBotId);

    /// <summary>
    /// Get all trades from all bots
    /// </summary>
    Task<List<TradeHistory>> GetAllTradesAsync();
}
