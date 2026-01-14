namespace BotReporter.Models;

public class BotStatus
{
    public bool IsRunning { get; set; }
    public string Status { get; set; } = string.Empty; // "Running", "Stopped", "Error"
}
