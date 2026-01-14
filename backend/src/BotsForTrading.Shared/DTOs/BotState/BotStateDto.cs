namespace BotsForTrading.Shared.DTOs.BotState;

public class BotStateDto
{
    public string BotId { get; set; } = string.Empty;
    public string BotName { get; set; } = string.Empty;
    public string Exchange { get; set; } = string.Empty;
    public string Account { get; set; } = string.Empty;
    public BotStatusDto? Status { get; set; }
    public PositionDto? Position { get; set; }
    public StrategySignalDto? StrategySignal { get; set; }
    public DateTime LastUpdate { get; set; }
}
