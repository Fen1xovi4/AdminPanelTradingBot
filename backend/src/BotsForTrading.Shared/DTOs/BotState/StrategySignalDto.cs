namespace BotsForTrading.Shared.DTOs.BotState;

/// <summary>
/// Информация о сигналах стратегии (ожидание входа)
/// </summary>
public class StrategySignalDto
{
    /// <summary>
    /// Готовность к Long входу
    /// </summary>
    public bool LongReady { get; set; }

    /// <summary>
    /// Количество баров выше EMA (для Long)
    /// </summary>
    public int LongBars { get; set; }

    /// <summary>
    /// Готовность к Short входу
    /// </summary>
    public bool ShortReady { get; set; }

    /// <summary>
    /// Количество баров ниже EMA (для Short)
    /// </summary>
    public int ShortBars { get; set; }

    /// <summary>
    /// Текущее значение EMA (или другого индикатора)
    /// </summary>
    public decimal? IndicatorValue { get; set; }

    /// <summary>
    /// Порог количества баров для входа
    /// </summary>
    public int Threshold { get; set; }

    /// <summary>
    /// Дополнительная информация (например, "Waiting for zone")
    /// </summary>
    public string? AdditionalInfo { get; set; }
}
