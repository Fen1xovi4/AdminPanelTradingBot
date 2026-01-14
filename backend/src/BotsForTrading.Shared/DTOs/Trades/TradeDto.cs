namespace BotsForTrading.Shared.DTOs.Trades;

public class TradeDto
{
    public int Id { get; set; }
    public int BotId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string TradingPair { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
    public decimal Fee { get; set; }
    public decimal ProfitLoss { get; set; }
    public DateTime ExecutedAt { get; set; }
    public string? ExternalOrderId { get; set; }
}
