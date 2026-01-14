namespace BotsForTrading.Shared.DTOs.Bots;

public class BotStatisticsDto
{
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
    public DateTime UpdatedAt { get; set; }
}
