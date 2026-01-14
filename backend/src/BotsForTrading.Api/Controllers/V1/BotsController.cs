using BotsForTrading.Api.Authorization;
using BotsForTrading.Core.Entities;
using BotsForTrading.Core.Interfaces;
using BotsForTrading.Shared.DTOs.Bots;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BotsForTrading.Api.Controllers.V1;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class BotsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<BotsController> _logger;

    public BotsController(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<BotsController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TradingBotDto>>> GetAll()
    {
        var query = _context.TradingBots
            .Include(b => b.Statistics)
            .AsQueryable();

        if (_currentUserService.Role != "Admin")
        {
            query = query.Where(b => b.UserId == _currentUserService.UserId);
        }

        var bots = await query.ToListAsync();

        return Ok(bots.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TradingBotDto>> GetById(int id)
    {
        var bot = await _context.TradingBots
            .Include(b => b.Statistics)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bot == null)
        {
            return NotFound();
        }

        if (_currentUserService.Role != "Admin" && bot.UserId != _currentUserService.UserId)
        {
            return Forbid();
        }

        return Ok(MapToDto(bot));
    }

    [HttpPost]
    public async Task<ActionResult<TradingBotDto>> Create([FromBody] CreateBotRequest request)
    {
        var bot = new TradingBot
        {
            Name = request.Name,
            Description = request.Description,
            Strategy = request.Strategy,
            Exchange = request.Exchange,
            TradingPair = request.TradingPair,
            InitialBalance = request.InitialBalance,
            CurrentBalance = request.InitialBalance,
            Status = "Inactive",
            UserId = _currentUserService.UserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.TradingBots.Add(bot);
        await _context.SaveChangesAsync();

        var statistics = new BotStatistics
        {
            BotId = bot.Id,
            UpdatedAt = DateTime.UtcNow
        };

        _context.BotStatistics.Add(statistics);
        await _context.SaveChangesAsync();

        bot.Statistics = statistics;

        _logger.LogInformation("Bot {BotName} created by user {UserId}", bot.Name, _currentUserService.UserId);

        return CreatedAtAction(nameof(GetById), new { id = bot.Id }, MapToDto(bot));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TradingBotDto>> Update(int id, [FromBody] UpdateBotRequest request)
    {
        var bot = await _context.TradingBots
            .Include(b => b.Statistics)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bot == null)
        {
            return NotFound();
        }

        if (_currentUserService.Role != "Admin" && bot.UserId != _currentUserService.UserId)
        {
            return Forbid();
        }

        if (!string.IsNullOrEmpty(request.Name))
            bot.Name = request.Name;

        if (!string.IsNullOrEmpty(request.Description))
            bot.Description = request.Description;

        if (!string.IsNullOrEmpty(request.Strategy))
            bot.Strategy = request.Strategy;

        if (!string.IsNullOrEmpty(request.Status))
        {
            bot.Status = request.Status;
            if (request.Status == "Active")
            {
                bot.LastActiveAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Bot {BotId} updated by user {UserId}", bot.Id, _currentUserService.UserId);

        return Ok(MapToDto(bot));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var bot = await _context.TradingBots.FindAsync(id);

        if (bot == null)
        {
            return NotFound();
        }

        if (_currentUserService.Role != "Admin" && bot.UserId != _currentUserService.UserId)
        {
            return Forbid();
        }

        _context.TradingBots.Remove(bot);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Bot {BotId} deleted by user {UserId}", bot.Id, _currentUserService.UserId);

        return NoContent();
    }

    private static TradingBotDto MapToDto(TradingBot bot)
    {
        return new TradingBotDto
        {
            Id = bot.Id,
            Name = bot.Name,
            Description = bot.Description,
            Strategy = bot.Strategy,
            Exchange = bot.Exchange,
            TradingPair = bot.TradingPair,
            ExternalBotId = bot.ExternalBotId,
            InitialBalance = bot.InitialBalance,
            CurrentBalance = bot.CurrentBalance,
            Status = bot.Status,
            CreatedAt = bot.CreatedAt,
            LastActiveAt = bot.LastActiveAt,
            UserId = bot.UserId,
            Statistics = bot.Statistics != null ? new BotStatisticsDto
            {
                TotalTrades = bot.Statistics.TotalTrades,
                WinningTrades = bot.Statistics.WinningTrades,
                LosingTrades = bot.Statistics.LosingTrades,
                TotalProfit = bot.Statistics.TotalProfit,
                TotalLoss = bot.Statistics.TotalLoss,
                NetProfit = bot.Statistics.NetProfit,
                WinRate = bot.Statistics.WinRate,
                AverageProfit = bot.Statistics.AverageProfit,
                AverageLoss = bot.Statistics.AverageLoss,
                MaxDrawdown = bot.Statistics.MaxDrawdown,
                UpdatedAt = bot.Statistics.UpdatedAt
            } : null
        };
    }
}
