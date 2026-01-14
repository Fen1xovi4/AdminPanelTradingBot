namespace BotsForTrading.Core.Entities;

public class BotLog
{
    public int Id { get; set; }
    public int BotId { get; set; }
    public string Level { get; set; } = string.Empty; // Info, Warning, Error
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public TradingBot Bot { get; set; } = null!;
}
