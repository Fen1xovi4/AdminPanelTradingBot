using BotsForTrading.Shared.DTOs.BotState;

namespace BotsForTrading.Core.Interfaces;

public interface IBotStateService
{
    Task UpdateBotStatusAsync(BotStatusDto status);
    Task UpdateBotPositionAsync(PositionDto position);
    Task UpdateStrategySignalAsync(string botId, StrategySignalDto signal);
    Task<BotStateDto?> GetBotStateAsync(string botId);
    Task<List<BotStateDto>> GetAllBotStatesAsync();
}
