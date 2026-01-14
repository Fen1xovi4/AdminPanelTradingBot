using BotsForTrading.Api.Authorization;
using BotsForTrading.Core.Interfaces;
using BotsForTrading.Shared.DTOs.Logs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BotsForTrading.Api.Controllers.V1;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class LogsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public LogsController(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet("bot/{botId}")]
    public async Task<ActionResult<IEnumerable<BotLogDto>>> GetByBotId(int botId, [FromQuery] int limit = 100)
    {
        var bot = await _context.TradingBots.FindAsync(botId);

        if (bot == null)
        {
            return NotFound();
        }

        if (_currentUserService.Role != "Admin" && bot.UserId != _currentUserService.UserId)
        {
            return Forbid();
        }

        var logs = await _context.BotLogs
            .Where(l => l.BotId == botId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync();

        return Ok(logs.Select(l => new BotLogDto
        {
            Id = l.Id,
            BotId = l.BotId,
            Level = l.Level,
            Message = l.Message,
            Details = l.Details,
            CreatedAt = l.CreatedAt
        }));
    }
}
