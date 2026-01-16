using System.Text.Json;
using BotsForTrading.Core.Interfaces;
using BotsForTrading.Infrastructure.Persistence;
using BotsForTrading.Shared.DTOs.BotState;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BotsForTrading.Infrastructure.Services;

public class BotStateService : IBotStateService
{
    private readonly string _dataDirectory;
    private readonly ILogger<BotStateService> _logger;
    private readonly ApplicationDbContext _context;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true
    };

    public BotStateService(ILogger<BotStateService> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
        _dataDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Data", "BotStates");

        // Ensure directory exists
        if (!Directory.Exists(_dataDirectory))
        {
            Directory.CreateDirectory(_dataDirectory);
        }
    }

    public async Task UpdateBotStatusAsync(BotStatusDto status)
    {
        try
        {
            var state = await GetOrCreateBotStateAsync(status.BotId);
            state.Status = status;
            state.LastUpdate = DateTime.UtcNow;

            // Update BotName in state from status
            if (!string.IsNullOrEmpty(status.BotName))
            {
                state.BotName = status.BotName;
            }

            await SaveBotStateAsync(state);

            // Update or create bot in database
            if (!string.IsNullOrEmpty(status.BotName) ||
                !string.IsNullOrEmpty(status.Exchange) ||
                !string.IsNullOrEmpty(status.Account))
            {
                var bot = await _context.TradingBots
                    .FirstOrDefaultAsync(b => b.ExternalBotId == status.BotId);

                if (bot != null)
                {
                    // Update existing bot
                    if (!string.IsNullOrEmpty(status.BotName))
                        bot.Name = status.BotName;
                    if (!string.IsNullOrEmpty(status.Exchange))
                        bot.Exchange = status.Exchange;
                    if (!string.IsNullOrEmpty(status.Account))
                        bot.Account = status.Account;
                    if (!string.IsNullOrEmpty(status.TradingPair))
                        bot.TradingPair = status.TradingPair;
                    bot.LastActiveAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Updated bot metadata for {BotId}: Name={Name}, Exchange={Exchange}, Account={Account}, TradingPair={TradingPair}",
                        status.BotId, status.BotName, status.Exchange, status.Account, status.TradingPair);
                }
                else
                {
                    // Create new bot automatically
                    var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
                    if (adminUser != null)
                    {
                        var newBot = new Core.Entities.TradingBot
                        {
                            Name = status.BotName ?? status.BotId,
                            Description = $"Auto-created bot from terminal",
                            Exchange = status.Exchange ?? "Unknown",
                            Account = status.Account ?? "Unknown",
                            ExternalBotId = status.BotId,
                            TradingPair = status.TradingPair ?? "Unknown",
                            Strategy = "EMA Deviation",
                            Status = status.IsRunning ? "Active" : "Stopped",
                            InitialBalance = 0,
                            CurrentBalance = 0,
                            UserId = adminUser.Id,
                            CreatedAt = DateTime.UtcNow,
                            LastActiveAt = DateTime.UtcNow
                        };

                        _context.TradingBots.Add(newBot);
                        await _context.SaveChangesAsync();

                        _logger.LogInformation("Auto-created new bot {BotId}: Name={Name}, Exchange={Exchange}, Account={Account}, TradingPair={TradingPair}",
                            status.BotId, status.BotName, status.Exchange, status.Account, status.TradingPair);
                    }
                }
            }

            _logger.LogInformation("Updated bot status for {BotId}", status.BotId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating bot status for {BotId}", status.BotId);
            throw;
        }
    }

    public async Task UpdateBotPositionAsync(PositionDto position)
    {
        try
        {
            var state = await GetOrCreateBotStateAsync(position.BotId);
            state.Position = position;
            state.LastUpdate = DateTime.UtcNow;

            await SaveBotStateAsync(state);
            _logger.LogInformation("Updated bot position for {BotId}", position.BotId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating bot position for {BotId}", position.BotId);
            throw;
        }
    }

    public async Task UpdateStrategySignalAsync(string botId, StrategySignalDto signal)
    {
        try
        {
            var state = await GetOrCreateBotStateAsync(botId);
            state.StrategySignal = signal;
            state.LastUpdate = DateTime.UtcNow;

            await SaveBotStateAsync(state);
            _logger.LogInformation("Updated strategy signal for {BotId}: Long={LongBars}/{Threshold}, Short={ShortBars}/{Threshold}",
                botId, signal.LongBars, signal.Threshold, signal.ShortBars, signal.Threshold);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating strategy signal for {BotId}", botId);
            throw;
        }
    }

    public async Task<BotStateDto?> GetBotStateAsync(string botId)
    {
        try
        {
            var filePath = GetBotStateFilePath(botId);

            if (!File.Exists(filePath))
            {
                return null;
            }

            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<BotStateDto>(json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading bot state for {BotId}", botId);
            return null;
        }
    }

    public async Task<List<BotStateDto>> GetAllBotStatesAsync()
    {
        var states = new List<BotStateDto>();

        try
        {
            var files = Directory.GetFiles(_dataDirectory, "*.json");

            foreach (var file in files)
            {
                var json = await File.ReadAllTextAsync(file);
                var state = JsonSerializer.Deserialize<BotStateDto>(json);

                if (state != null)
                {
                    states.Add(state);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading all bot states");
        }

        return states;
    }

    private async Task<BotStateDto> GetOrCreateBotStateAsync(string botId)
    {
        var state = await GetBotStateAsync(botId);

        if (state == null)
        {
            state = new BotStateDto
            {
                BotId = botId,
                BotName = botId,
                LastUpdate = DateTime.UtcNow
            };
        }

        return state;
    }

    private async Task SaveBotStateAsync(BotStateDto state)
    {
        var filePath = GetBotStateFilePath(state.BotId);
        var json = JsonSerializer.Serialize(state, JsonOptions);
        await File.WriteAllTextAsync(filePath, json);
    }

    private string GetBotStateFilePath(string botId)
    {
        var safeFileName = string.Concat(botId.Split(Path.GetInvalidFileNameChars()));
        return Path.Combine(_dataDirectory, $"{safeFileName}.json");
    }
}
