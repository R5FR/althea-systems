namespace Application.Validators;

using Application.DTOs;
using FluentValidation;

public class PaymentMethodValidator : AbstractValidator<PaymentMethodDto>
{
    public PaymentMethodValidator()
    {
        RuleFor(x => x.CardType)
            .NotEmpty().WithMessage("CardType is required")
            .Must(x => new[] { "Visa", "MasterCard", "AmEx" }.Contains(x)).WithMessage("CardType must be Visa, MasterCard, or AmEx");

        RuleFor(x => x.Last4)
            .NotEmpty().WithMessage("Last4 is required")
            .Length(4).WithMessage("Last4 must be exactly 4 characters")
            .Matches(@"^\d{4}$").WithMessage("Last4 must contain only digits");

        RuleFor(x => x.ExpiryMonth)
            .GreaterThanOrEqualTo(1).WithMessage("ExpiryMonth must be between 1 and 12")
            .LessThanOrEqualTo(12).WithMessage("ExpiryMonth must be between 1 and 12");

        RuleFor(x => x.ExpiryYear)
            .GreaterThanOrEqualTo(DateTime.Now.Year).WithMessage("ExpiryYear must be current year or later");
    }
}
