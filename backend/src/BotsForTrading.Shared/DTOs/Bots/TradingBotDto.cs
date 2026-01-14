namespace BotsForTrading.Shared.DTOs.Bots;

public class TradingBotDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Strategy { get; set; } = string.Empty;
    public string Exchange { get; set; } = string.Empty;
    public string TradingPair { get; set; } = string.Empty;
    public string? ExternalBotId { get; set; }
    public decimal InitialBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastActiveAt { get; set; }
    public int UserId { get; set; }
    public BotStatisticsDto? Statistics { get; set; }
}
