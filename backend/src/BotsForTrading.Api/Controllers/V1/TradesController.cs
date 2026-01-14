using BotsForTrading.Api.Authorization;
using BotsForTrading.Core.Interfaces;
using BotsForTrading.Shared.DTOs.Trades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BotsForTrading.Api.Controllers.V1;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class TradesController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public TradesController(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet("bot/{botId}")]
    public async Task<ActionResult<IEnumerable<TradeDto>>> GetByBotId(int botId)
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

        var trades = await _context.Trades
            .Where(t => t.BotId == botId)
            .OrderByDescending(t => t.ExecutedAt)
            .ToListAsync();

        return Ok(trades.Select(t => new TradeDto
        {
            Id = t.Id,
            BotId = t.BotId,
            Type = t.Type,
            TradingPair = t.TradingPair,
            Amount = t.Amount,
            Price = t.Price,
            Total = t.Total,
            Fee = t.Fee,
            ProfitLoss = t.ProfitLoss,
            ExecutedAt = t.ExecutedAt,
            ExternalOrderId = t.ExternalOrderId
        }));
    }
}
