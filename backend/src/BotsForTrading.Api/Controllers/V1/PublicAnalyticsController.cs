using BotsForTrading.Core.Interfaces;
using BotsForTrading.Shared.DTOs.Analytics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BotsForTrading.Api.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
public class PublicAnalyticsController : ControllerBase
{
    private readonly IPublicAnalyticsService _publicAnalyticsService;
    private readonly ILogger<PublicAnalyticsController> _logger;

    public PublicAnalyticsController(
        IPublicAnalyticsService publicAnalyticsService,
        ILogger<PublicAnalyticsController> logger)
    {
        _publicAnalyticsService = publicAnalyticsService;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PublicAnalyticsDto>> GetPublicAnalytics(
        [FromQuery] string period = "all")
    {
        if (period != "7" && period != "30" && period != "90" && period != "all")
        {
            period = "all";
        }

        var analytics = await _publicAnalyticsService.GetPublicAnalyticsAsync(period);
        return Ok(analytics);
    }
}
