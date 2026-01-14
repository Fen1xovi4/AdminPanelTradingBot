namespace BotsForTrading.Core.Entities;

public class BotStatistics
{
    public int Id { get; set; }
    public int BotId { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public int LosingTrades { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal TotalLoss { get; set; }
    public decimal NetProfit { get; set; }
    public decimal WinRate { get; set; }
    public decimal AverageProfit { get; set; }
    public decimal AverageLoss { get; set; }
    public decimal MaxDrawdown { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public TradingBot Bot { get; set; } = null!;
}
