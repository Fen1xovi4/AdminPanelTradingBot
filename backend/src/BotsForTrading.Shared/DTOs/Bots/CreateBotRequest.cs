namespace BotsForTrading.Shared.DTOs.Bots;

public class CreateBotRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Strategy { get; set; } = string.Empty;
    public string Exchange { get; set; } = string.Empty;
    public string TradingPair { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
}
