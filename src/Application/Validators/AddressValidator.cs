namespace Application.Validators;

using Application.DTOs;
using FluentValidation;

public class AddressValidator : AbstractValidator<AddressDto>
{
    public AddressValidator()
    {
        RuleFor(x => x.AddressLine1)
            .NotEmpty().WithMessage("AddressLine1 is required")
            .MaximumLength(255).WithMessage("AddressLine1 must not exceed 255 characters");

        RuleFor(x => x.AddressLine2)
            .MaximumLength(255).WithMessage("AddressLine2 must not exceed 255 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100).WithMessage("City must not exceed 100 characters");

        RuleFor(x => x.Region)
            .NotEmpty().WithMessage("Region is required")
            .MaximumLength(100).WithMessage("Region must not exceed 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("PostalCode is required")
            .MaximumLength(20).WithMessage("PostalCode must not exceed 20 characters");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters");

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Phone must not exceed 20 characters");
    }
}
