using Asp.Versioning;
using BotsForTrading.Core.Interfaces;
using BotsForTrading.Shared.DTOs.BotState;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BotsForTrading.Api.Controllers.V1;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
public class BotStateController : ControllerBase
{
    private readonly IBotStateService _botStateService;
    private readonly ILogger<BotStateController> _logger;

    public BotStateController(
        IBotStateService botStateService,
        ILogger<BotStateController> logger)
    {
        _botStateService = botStateService;
        _logger = logger;
    }

    /// <summary>
    /// Update bot status (for DLL to call)
    /// </summary>
    [HttpPost("{botId}/status")]
    [AllowAnonymous] // Для тестирования. Позже добавьте API ключ
    public async Task<IActionResult> UpdateStatus(string botId, [FromBody] BotStatusDto status)
    {
        try
        {
            status.BotId = botId;
            await _botStateService.UpdateBotStatusAsync(status);
            return Ok(new { message = "Status updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for bot {BotId}", botId);
            return StatusCode(500, new { error = "Failed to update status" });
        }
    }

    /// <summary>
    /// Update bot position (for DLL to call)
    /// </summary>
    [HttpPost("{botId}/position")]
    [AllowAnonymous] // Для тестирования. Позже добавьте API ключ
    public async Task<IActionResult> UpdatePosition(string botId, [FromBody] PositionDto position)
    {
        try
        {
            position.BotId = botId;
            await _botStateService.UpdateBotPositionAsync(position);
            return Ok(new { message = "Position updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating position for bot {BotId}", botId);
            return StatusCode(500, new { error = "Failed to update position" });
        }
    }

    /// <summary>
    /// Update bot strategy signal (for DLL to call)
    /// </summary>
    [HttpPost("{botId}/signal")]
    [AllowAnonymous] // Для тестирования. Позже добавьте API ключ
    public async Task<IActionResult> UpdateSignal(string botId, [FromBody] StrategySignalDto signal)
    {
        try
        {
            await _botStateService.UpdateStrategySignalAsync(botId, signal);
            return Ok(new { message = "Strategy signal updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating strategy signal for bot {BotId}", botId);
            return StatusCode(500, new { error = "Failed to update strategy signal" });
        }
    }

    /// <summary>
    /// Get current state of a specific bot
    /// </summary>
    [HttpGet("{botId}")]
    [Authorize]
    public async Task<IActionResult> GetBotState(string botId)
    {
        try
        {
            var state = await _botStateService.GetBotStateAsync(botId);

            if (state == null)
            {
                return NotFound(new { error = "Bot state not found" });
            }

            return Ok(state);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting state for bot {BotId}", botId);
            return StatusCode(500, new { error = "Failed to get bot state" });
        }
    }

    /// <summary>
    /// Get states of all bots
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAllBotStates()
    {
        try
        {
            var states = await _botStateService.GetAllBotStatesAsync();
            return Ok(states);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all bot states");
            return StatusCode(500, new { error = "Failed to get bot states" });
        }
    }
}
