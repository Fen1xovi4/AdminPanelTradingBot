namespace BotsForTrading.Core.Entities;

/// <summary>
/// Represents a completed trade (position) with its outcome
/// </summary>
public class TradeHistory
{
    public int Id { get; set; }
    public int BotId { get; set; }

    /// <summary>
    /// Trading pair (e.g., BTCUSDT)
    /// </summary>
    public string TradingPair { get; set; } = string.Empty;

    /// <summary>
    /// Position side (Long/Short)
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
    /// Status: Success (profit), Loss (loss), Error (technical error)
    /// </summary>
    public string Status { get; set; } = string.Empty; // Success, Loss, Error

    /// <summary>
    /// Error message if status is Error
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// When the position was opened
    /// </summary>
    public DateTime OpenedAt { get; set; }

    /// <summary>
    /// When the position was closed
    /// </summary>
    public DateTime ClosedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public TradingBot Bot { get; set; } = null!;
}
