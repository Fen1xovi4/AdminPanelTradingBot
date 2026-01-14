namespace BotsForTrading.Core.Entities;

public class TradingBot
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Strategy { get; set; } = string.Empty;
    public string Exchange { get; set; } = string.Empty;
    public string Account { get; set; } = string.Empty;
    public string TradingPair { get; set; } = string.Empty;
    public string? ExternalBotId { get; set; }
    public decimal InitialBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string Status { get; set; } = "Inactive"; // Inactive, Active, Paused, Error
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActiveAt { get; set; }
    public int UserId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Trade> Trades { get; set; } = new List<Trade>();
    public ICollection<BotLog> Logs { get; set; } = new List<BotLog>();
    public BotStatistics? Statistics { get; set; }
    public ICollection<TradeHistory> TradeHistories { get; set; } = new List<TradeHistory>();
}
