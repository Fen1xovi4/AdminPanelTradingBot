namespace BotsForTrading.Shared.DTOs.BotState;

public class PositionDto
{
    public string BotId { get; set; } = string.Empty;
    public bool InPosition { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal TakeProfit { get; set; }
    public decimal StopLoss { get; set; }
    public decimal PositionSize { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal UnrealizedPnL { get; set; }
    public string PositionSide { get; set; } = string.Empty; // "Long" or "Short"
    public decimal AccountBalance { get; set; } // Balance from exchange (USDT)
    public DateTime Timestamp { get; set; }
}
