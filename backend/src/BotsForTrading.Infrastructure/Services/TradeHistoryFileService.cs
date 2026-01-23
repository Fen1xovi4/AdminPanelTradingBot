using System.Text.Json;
using BotsForTrading.Core.Entities;
using BotsForTrading.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace BotsForTrading.Infrastructure.Services;

/// <summary>
/// Service for managing trade history in JSON file storage
/// </summary>
public class TradeHistoryFileService : ITradeHistoryFileService
{
    private readonly string _dataDirectory;
    private readonly ILogger<TradeHistoryFileService> _logger;
    private readonly SemaphoreSlim _fileLock = new(1, 1);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public TradeHistoryFileService(ILogger<TradeHistoryFileService> logger)
    {
        _logger = logger;

        // Create data directory in the application root
        // Use "Data" (capital D) to match Docker volume mount path
        var baseDirectory = AppContext.BaseDirectory;
        _dataDirectory = Path.Combine(baseDirectory, "Data", "trade-history");

        if (!Directory.Exists(_dataDirectory))
        {
            Directory.CreateDirectory(_dataDirectory);
            _logger.LogInformation("Created trade history directory: {Directory}", _dataDirectory);
        }
    }

    /// <summary>
    /// Save a completed trade to file
    /// </summary>
    public async Task SaveTradeAsync(TradeHistory trade)
    {
        await _fileLock.WaitAsync();
        try
        {
            var fileName = GetFileNameForBot(trade.BotId);
            var filePath = Path.Combine(_dataDirectory, fileName);

            // Read existing trades
            var trades = await ReadTradesFromFileAsync(filePath);

            // Add new trade
            trade.Id = trades.Any() ? trades.Max(t => t.Id) + 1 : 1;
            trades.Add(trade);

            // Save to file
            await WriteTradeToFileAsync(filePath, trades);

            _logger.LogInformation(
                "Saved trade {TradeId} for bot {BotId} to file: {FilePath}",
                trade.Id, trade.BotId, filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving trade for bot {BotId}", trade.BotId);
            throw;
        }
        finally
        {
            _fileLock.Release();
        }
    }

    /// <summary>
    /// Get all trades for a specific bot
    /// </summary>
    public async Task<List<TradeHistory>> GetTradesByBotIdAsync(int botId)
    {
        await _fileLock.WaitAsync();
        try
        {
            var fileName = GetFileNameForBot(botId);
            var filePath = Path.Combine(_dataDirectory, fileName);

            if (!File.Exists(filePath))
            {
                return new List<TradeHistory>();
            }

            var trades = await ReadTradesFromFileAsync(filePath);
            return trades.OrderByDescending(t => t.ClosedAt).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading trades for bot {BotId}", botId);
            return new List<TradeHistory>();
        }
        finally
        {
            _fileLock.Release();
        }
    }

    /// <summary>
    /// Get all trades for a specific bot by external bot ID
    /// </summary>
    public async Task<List<TradeHistory>> GetTradesByExternalBotIdAsync(string externalBotId)
    {
        // For external bot ID, we'll search through all files
        // This is less efficient but works with the file-based approach
        await _fileLock.WaitAsync();
        try
        {
            var allFiles = Directory.GetFiles(_dataDirectory, "bot_*.json");
            var allTrades = new List<TradeHistory>();

            foreach (var file in allFiles)
            {
                var trades = await ReadTradesFromFileAsync(file);
                allTrades.AddRange(trades);
            }

            return allTrades.OrderByDescending(t => t.ClosedAt).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading trades for external bot {ExternalBotId}", externalBotId);
            return new List<TradeHistory>();
        }
        finally
        {
            _fileLock.Release();
        }
    }

    /// <summary>
    /// Get all trades from all bots
    /// </summary>
    public async Task<List<TradeHistory>> GetAllTradesAsync()
    {
        await _fileLock.WaitAsync();
        try
        {
            if (!Directory.Exists(_dataDirectory))
            {
                return new List<TradeHistory>();
            }

            var allFiles = Directory.GetFiles(_dataDirectory, "bot_*.json");
            var allTrades = new List<TradeHistory>();

            foreach (var file in allFiles)
            {
                var trades = await ReadTradesFromFileAsync(file);
                allTrades.AddRange(trades);
            }

            return allTrades.OrderByDescending(t => t.ClosedAt).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading all trades");
            return new List<TradeHistory>();
        }
        finally
        {
            _fileLock.Release();
        }
    }

    /// <summary>
    /// Delete all trades for a specific bot (removes the JSON file)
    /// </summary>
    public async Task DeleteTradesForBotAsync(int botId)
    {
        await _fileLock.WaitAsync();
        try
        {
            var fileName = GetFileNameForBot(botId);
            var filePath = Path.Combine(_dataDirectory, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation("Deleted trade history file for bot {BotId}: {FilePath}", botId, filePath);
            }
            else
            {
                _logger.LogInformation("No trade history file found for bot {BotId}", botId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting trade history file for bot {BotId}", botId);
            throw;
        }
        finally
        {
            _fileLock.Release();
        }
    }

    private static string GetFileNameForBot(int botId)
    {
        return $"bot_{botId}_trades.json";
    }

    private async Task<List<TradeHistory>> ReadTradesFromFileAsync(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return new List<TradeHistory>();
        }

        try
        {
            var json = await File.ReadAllTextAsync(filePath);
            var trades = JsonSerializer.Deserialize<List<TradeHistory>>(json, JsonOptions);
            return trades ?? new List<TradeHistory>();
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize trades from {FilePath}, returning empty list", filePath);
            return new List<TradeHistory>();
        }
    }

    private async Task WriteTradeToFileAsync(string filePath, List<TradeHistory> trades)
    {
        var json = JsonSerializer.Serialize(trades, JsonOptions);
        await File.WriteAllTextAsync(filePath, json);
    }
}
