namespace BotsForTrading.Shared.DTOs.Bots;

public class UpdateBotRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Strategy { get; set; }
    public string? Status { get; set; }
}
