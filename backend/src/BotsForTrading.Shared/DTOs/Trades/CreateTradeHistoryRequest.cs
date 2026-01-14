namespace BotsForTrading.Shared.DTOs.Trades;

public class CreateTradeHistoryRequest
{
    public string TradingPair { get; set; } = string.Empty;
    public string PositionSide { get; set; } = string.Empty;
    public decimal EntryPrice { get; set; }
    public decimal ExitPrice { get; set; }
    public decimal PositionSize { get; set; }
    public decimal RealizedPnL { get; set; }
    public string Status { get; set; } = string.Empty; // Success, Loss, Error
    public string? ErrorMessage { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
}
