using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using BotReporter.Models;

namespace BotReporter;

/// <summary>
/// Client library for reporting bot state to the admin panel
/// Use this in your trading bot to send status and position updates
/// </summary>
public class BotStateReporter : IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _botId;
    private bool _disposed;

    /// <summary>
    /// Initialize the reporter
    /// </summary>
    /// <param name="apiUrl">Base URL of your API (e.g., "http://localhost:5000")</param>
    /// <param name="botId">Unique identifier for your bot</param>
    /// <param name="apiKey">Optional API key for authentication (not implemented yet)</param>
    public BotStateReporter(string apiUrl, string botId, string? apiKey = null)
    {
        _apiUrl = apiUrl.TrimEnd('/');
        _botId = botId;
        _httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(10)
        };

        if (!string.IsNullOrEmpty(apiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("X-API-Key", apiKey);
        }
    }

    /// <summary>
    /// Update bot status (running, stopped, error)
    /// </summary>
    public async Task<bool> UpdateBotStatusAsync(BotStatus status)
    {
        try
        {
            var data = new
            {
                BotId = _botId,
                status.IsRunning,
                status.Status,
                Timestamp = DateTime.UtcNow
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_apiUrl}/api/v1/botstate/{_botId}/status",
                data
            );

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BotReporter] Error updating status: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Update current position information
    /// </summary>
    public async Task<bool> UpdatePositionAsync(PositionInfo position)
    {
        try
        {
            var data = new
            {
                BotId = _botId,
                position.InPosition,
                position.EntryPrice,
                position.TakeProfit,
                position.StopLoss,
                position.PositionSize,
                position.CurrentPrice,
                position.UnrealizedPnL,
                position.PositionSide,
                position.AccountBalance,
                Timestamp = DateTime.UtcNow
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_apiUrl}/api/v1/botstate/{_botId}/position",
                data
            );

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BotReporter] Error updating position: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Convenience method: Report that bot started
    /// </summary>
    /// <param name="botName">Name of the bot</param>
    /// <param name="exchange">Exchange name (e.g., "BitGet-M")</param>
    /// <param name="account">Account name (e.g., "BrickLab")</param>
    public async Task<bool> ReportBotStartedAsync(string botName, string exchange, string account)
    {
        try
        {
            var data = new
            {
                BotId = _botId,
                BotName = botName,
                Exchange = exchange,
                Account = account,
                IsRunning = true,
                Status = "Running",
                Timestamp = DateTime.UtcNow
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_apiUrl}/api/v1/botstate/{_botId}/status",
                data
            );

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BotReporter] Error reporting bot started: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Convenience method: Report that bot stopped
    /// </summary>
    public Task<bool> ReportBotStoppedAsync()
    {
        return UpdateBotStatusAsync(new BotStatus
        {
            IsRunning = false,
            Status = "Stopped"
        });
    }

    /// <summary>
    /// Convenience method: Report bot error
    /// </summary>
    public Task<bool> ReportBotErrorAsync()
    {
        return UpdateBotStatusAsync(new BotStatus
        {
            IsRunning = false,
            Status = "Error"
        });
    }

    /// <summary>
    /// Convenience method: Report no position
    /// </summary>
    public Task<bool> ReportNoPositionAsync()
    {
        return UpdatePositionAsync(new PositionInfo
        {
            InPosition = false
        });
    }

    /// <summary>
    /// Update strategy signal information (waiting for entry)
    /// </summary>
    public async Task<bool> UpdateStrategySignalAsync(StrategySignalInfo signal)
    {
        try
        {
            var data = new
            {
                BotId = _botId,
                signal.LongReady,
                signal.LongBars,
                signal.ShortReady,
                signal.ShortBars,
                signal.IndicatorValue,
                signal.Threshold,
                signal.AdditionalInfo,
                Timestamp = DateTime.UtcNow
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_apiUrl}/api/v1/botstate/{_botId}/signal",
                data
            );

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BotReporter] Error updating strategy signal: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Report a completed trade to the admin panel
    /// This saves the trade in the history for visualization
    /// </summary>
    public async Task<bool> ReportCompletedTradeAsync(CompletedTrade trade)
    {
        try
        {
            var data = new
            {
                trade.TradingPair,
                trade.PositionSide,
                trade.EntryPrice,
                trade.ExitPrice,
                trade.PositionSize,
                trade.RealizedPnL,
                trade.Status,
                trade.ErrorMessage,
                trade.OpenedAt,
                ClosedAt = trade.ClosedAt ?? DateTime.UtcNow
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"{_apiUrl}/api/v1/tradehistory/{_botId}",
                data
            );

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BotReporter] Error reporting completed trade: {ex.Message}");
            return false;
        }
    }

    public void Dispose()
    {
        if (_disposed) return;

        _httpClient?.Dispose();
        _disposed = true;
        GC.SuppressFinalize(this);
    }
}
