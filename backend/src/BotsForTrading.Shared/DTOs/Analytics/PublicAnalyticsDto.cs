namespace BotsForTrading.Shared.DTOs.Analytics;

public class PublicAnalyticsDto
{
    public decimal TotalProfit { get; set; }
    public int TotalTrades { get; set; }
    public int WinningTrades { get; set; }
    public decimal WinRate { get; set; }
    public int ActiveBots { get; set; }
    public int TotalBots { get; set; }
    public string Period { get; set; } = "all";
    public List<ChartPointDto> ChartData { get; set; } = new();
}

public class ChartPointDto
{
    public string Date { get; set; } = string.Empty;
    public string FullDate { get; set; } = string.Empty;
    public decimal Pnl { get; set; }
}
