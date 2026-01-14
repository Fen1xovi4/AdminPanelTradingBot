namespace BotReporter.Models;

/// <summary>
/// Represents a completed trade (position) to be reported to the admin panel
/// </summary>
public class CompletedTrade
{
    /// <summary>
    /// Trading pair (e.g., "BTCUSDT")
    /// </summary>
    public string TradingPair { get; set; } = string.Empty;

    /// <summary>
    /// Position side: "Long" or "Short"
    /// </summary>
    public string PositionSide { get; set; } = string.Empty;

    /// <summary>
    /// Entry price
    /// </summary>
    public decimal EntryPrice { get; set; }

    /// <summary>
    /// Exit price (when position was closed)
    /// </summary>
    public decimal ExitPrice { get; set; }

    /// <summary>
    /// Position size in USD
    /// </summary>
    public decimal PositionSize { get; set; }

    /// <summary>
    /// Realized profit or loss
    /// </summary>
    public decimal RealizedPnL { get; set; }

    /// <summary>
    /// Status: "Success" (profit), "Loss" (loss), "Error" (technical error)
    /// </summary>
    public string Status { get; set; } = "Success";

    /// <summary>
    /// Error message if status is "Error"
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// When the position was opened
    /// </summary>
    public DateTime OpenedAt { get; set; }

    /// <summary>
    /// When the position was closed (defaults to now)
    /// </summary>
    public DateTime? ClosedAt { get; set; }

    /// <summary>
    /// Create a successful trade (profit)
    /// </summary>
    public static CompletedTrade CreateProfit(
        string tradingPair,
        string positionSide,
        decimal entryPrice,
        decimal exitPrice,
        decimal positionSize,
        decimal realizedPnL,
        DateTime openedAt)
    {
        return new CompletedTrade
        {
            TradingPair = tradingPair,
            PositionSide = positionSide,
            EntryPrice = entryPrice,
            ExitPrice = exitPrice,
            PositionSize = positionSize,
            RealizedPnL = realizedPnL,
            Status = "Success",
            OpenedAt = openedAt,
            ClosedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Create a loss trade
    /// </summary>
    public static CompletedTrade CreateLoss(
        string tradingPair,
        string positionSide,
        decimal entryPrice,
        decimal exitPrice,
        decimal positionSize,
        decimal realizedPnL,
        DateTime openedAt)
    {
        return new CompletedTrade
        {
            TradingPair = tradingPair,
            PositionSide = positionSide,
            EntryPrice = entryPrice,
            ExitPrice = exitPrice,
            PositionSize = positionSize,
            RealizedPnL = realizedPnL,
            Status = "Loss",
            OpenedAt = openedAt,
            ClosedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Create an error trade (e.g., failed to close position, position disappeared)
    /// </summary>
    public static CompletedTrade CreateError(
        string tradingPair,
        string positionSide,
        decimal entryPrice,
        decimal positionSize,
        DateTime openedAt,
        string errorMessage)
    {
        return new CompletedTrade
        {
            TradingPair = tradingPair,
            PositionSide = positionSide,
            EntryPrice = entryPrice,
            ExitPrice = 0,
            PositionSize = positionSize,
            RealizedPnL = 0,
            Status = "Error",
            ErrorMessage = errorMessage,
            OpenedAt = openedAt,
            ClosedAt = DateTime.UtcNow
        };
    }
}
