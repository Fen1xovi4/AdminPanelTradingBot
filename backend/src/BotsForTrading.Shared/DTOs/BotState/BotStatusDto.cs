namespace BotsForTrading.Shared.DTOs.BotState;

public class BotStatusDto
{
    public string BotId { get; set; } = string.Empty;
    public string? BotName { get; set; }
    public string? Exchange { get; set; }
    public string? Account { get; set; }
    public bool IsRunning { get; set; }
    public string Status { get; set; } = string.Empty; // "Running", "Stopped", "Error"
    public DateTime Timestamp { get; set; }
}
