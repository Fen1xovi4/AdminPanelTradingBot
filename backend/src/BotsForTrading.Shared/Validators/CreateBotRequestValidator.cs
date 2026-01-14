using BotsForTrading.Shared.DTOs.Bots;
using FluentValidation;

namespace BotsForTrading.Shared.Validators;

public class CreateBotRequestValidator : AbstractValidator<CreateBotRequest>
{
    public CreateBotRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Bot name is required")
            .MaximumLength(255);

        RuleFor(x => x.Description)
            .MaximumLength(1000);

        RuleFor(x => x.Strategy)
            .NotEmpty().WithMessage("Strategy is required")
            .MaximumLength(100);

        RuleFor(x => x.Exchange)
            .NotEmpty().WithMessage("Exchange is required")
            .MaximumLength(100);

        RuleFor(x => x.TradingPair)
            .NotEmpty().WithMessage("Trading pair is required")
            .MaximumLength(20);

        RuleFor(x => x.InitialBalance)
            .GreaterThan(0).WithMessage("Initial balance must be greater than 0");
    }
}
