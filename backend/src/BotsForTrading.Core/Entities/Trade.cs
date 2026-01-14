namespace BotsForTrading.Core.Entities;

public class Trade
{
    public int Id { get; set; }
    public int BotId { get; set; }
    public string Type { get; set; } = string.Empty; // Buy, Sell
    public string TradingPair { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
    public decimal Fee { get; set; }
    public decimal ProfitLoss { get; set; }
    public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
    public string? ExternalOrderId { get; set; }

    // Navigation properties
    public TradingBot Bot { get; set; } = null!;
}
