namespace Application.Validators;

using Application.DTOs;
using FluentValidation;

public class PaymentMethodValidator : AbstractValidator<PaymentMethodDto>
{
    public PaymentMethodValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty().WithMessage("Provider is required")
            .MaximumLength(50).WithMessage("Provider must not exceed 50 characters");

        RuleFor(x => x.CardBrand)
            .NotEmpty().WithMessage("CardBrand is required")
            .Must(x => new[] { "Visa", "MasterCard", "AmEx", "Discover" }.Contains(x)).WithMessage("CardBrand must be Visa, MasterCard, AmEx, or Discover");

        RuleFor(x => x.Last4)
            .NotEmpty().WithMessage("Last4 is required")
            .Length(4).WithMessage("Last4 must be exactly 4 characters")
            .Matches(@"^\d{4}$").WithMessage("Last4 must contain only digits");

        RuleFor(x => x.ExpMonth)
            .GreaterThanOrEqualTo(1).WithMessage("ExpMonth must be between 1 and 12")
            .LessThanOrEqualTo(12).WithMessage("ExpMonth must be between 1 and 12");

        RuleFor(x => x.ExpYear)
            .GreaterThanOrEqualTo(DateTime.Now.Year).WithMessage("ExpYear must be current year or later");
    }
}
