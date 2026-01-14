using BotsForTrading.Api.Authorization;
using BotsForTrading.Core.Entities;
using BotsForTrading.Core.Interfaces;
using BotsForTrading.Shared.DTOs.Trades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BotsForTrading.Api.Controllers.V1;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class TradeHistoryController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITradeHistoryFileService _tradeHistoryFileService;

    public TradeHistoryController(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ITradeHistoryFileService tradeHistoryFileService)
    {
        _context = context;
        _currentUserService = currentUserService;
        _tradeHistoryFileService = tradeHistoryFileService;
    }

    /// <summary>
    /// Get all trade history
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TradeHistoryDto>>> GetAll()
    {
        var tradeHistories = await _tradeHistoryFileService.GetAllTradesAsync();

        return Ok(tradeHistories.Select(t => new TradeHistoryDto
        {
            Id = t.Id,
            BotId = t.BotId,
            TradingPair = t.TradingPair,
            PositionSide = t.PositionSide,
            EntryPrice = t.EntryPrice,
            ExitPrice = t.ExitPrice,
            PositionSize = t.PositionSize,
            RealizedPnL = t.RealizedPnL,
            Status = t.Status,
            ErrorMessage = t.ErrorMessage,
            OpenedAt = t.OpenedAt,
            ClosedAt = t.ClosedAt
        }));
    }

    /// <summary>
    /// Get trade history for a specific bot
    /// </summary>
    [HttpGet("bot/{botId}")]
    public async Task<ActionResult<IEnumerable<TradeHistoryDto>>> GetByBotId(int botId)
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

        // Read trade history from file
        var tradeHistories = await _tradeHistoryFileService.GetTradesByBotIdAsync(botId);

        return Ok(tradeHistories.Select(t => new TradeHistoryDto
        {
            Id = t.Id,
            BotId = t.BotId,
            TradingPair = t.TradingPair,
            PositionSide = t.PositionSide,
            EntryPrice = t.EntryPrice,
            ExitPrice = t.ExitPrice,
            PositionSize = t.PositionSize,
            RealizedPnL = t.RealizedPnL,
            Status = t.Status,
            ErrorMessage = t.ErrorMessage,
            OpenedAt = t.OpenedAt,
            ClosedAt = t.ClosedAt
        }));
    }

    /// <summary>
    /// Create a new trade history record
    /// This endpoint is called by bots when a trade is completed
    /// </summary>
    [HttpPost("{externalBotId}")]
    [AllowAnonymous] // Allow bots to report without authentication
    public async Task<ActionResult<TradeHistoryDto>> Create(string externalBotId, CreateTradeHistoryRequest request)
    {
        var bot = await _context.TradingBots
            .FirstOrDefaultAsync(b => b.ExternalBotId == externalBotId);

        if (bot == null)
        {
            return NotFound(new { error = "Bot not found" });
        }

        var tradeHistory = new TradeHistory
        {
            BotId = bot.Id,
            TradingPair = request.TradingPair,
            PositionSide = request.PositionSide,
            EntryPrice = request.EntryPrice,
            ExitPrice = request.ExitPrice,
            PositionSize = request.PositionSize,
            RealizedPnL = request.RealizedPnL,
            Status = request.Status,
            ErrorMessage = request.ErrorMessage,
            OpenedAt = request.OpenedAt,
            ClosedAt = request.ClosedAt ?? DateTime.UtcNow
        };

        // Save to file instead of database
        await _tradeHistoryFileService.SaveTradeAsync(tradeHistory);

        return CreatedAtAction(
            nameof(GetByBotId),
            new { botId = tradeHistory.BotId },
            new TradeHistoryDto
            {
                Id = tradeHistory.Id,
                BotId = tradeHistory.BotId,
                TradingPair = tradeHistory.TradingPair,
                PositionSide = tradeHistory.PositionSide,
                EntryPrice = tradeHistory.EntryPrice,
                ExitPrice = tradeHistory.ExitPrice,
                PositionSize = tradeHistory.PositionSize,
                RealizedPnL = tradeHistory.RealizedPnL,
                Status = tradeHistory.Status,
                ErrorMessage = tradeHistory.ErrorMessage,
                OpenedAt = tradeHistory.OpenedAt,
                ClosedAt = tradeHistory.ClosedAt
            });
    }
}
