namespace BotReporter.Models;

public class PositionInfo
{
    public bool InPosition { get; set; }
    public decimal EntryPrice { get; set; }
    public decimal TakeProfit { get; set; }
    public decimal StopLoss { get; set; }
    public decimal PositionSize { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal UnrealizedPnL { get; set; }
    public string PositionSide { get; set; } = string.Empty; // "Long" or "Short"
    public decimal AccountBalance { get; set; } // Balance from exchange (USDT)
}
