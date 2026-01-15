namespace BotsForTrading.Core.Interfaces;

public interface IBotStatisticsService
{
    /// <summary>
    /// Recalculates and updates statistics for a specific bot based on trade history
    /// </summary>
    /// <param name="botId">The internal bot ID</param>
    Task RecalculateStatisticsAsync(int botId);

    /// <summary>
    /// Recalculates statistics for all bots
    /// </summary>
    Task RecalculateAllStatisticsAsync();
}
