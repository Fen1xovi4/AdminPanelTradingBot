using BotsForTrading.Shared.DTOs.Analytics;

namespace BotsForTrading.Core.Interfaces;

public interface IPublicAnalyticsService
{
    Task<PublicAnalyticsDto> GetPublicAnalyticsAsync(string period);
}
