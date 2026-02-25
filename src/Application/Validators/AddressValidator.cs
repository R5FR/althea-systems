namespace Application.Validators;

using Application.DTOs;
using FluentValidation;

public class AddressValidator : AbstractValidator<AddressDto>
{
    public AddressValidator()
    {
        RuleFor(x => x.Street)
            .NotEmpty().WithMessage("Street is required")
            .MaximumLength(255).WithMessage("Street must not exceed 255 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100).WithMessage("City must not exceed 100 characters");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required")
            .MaximumLength(100).WithMessage("State must not exceed 100 characters");

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("PostalCode is required")
            .MaximumLength(20).WithMessage("PostalCode must not exceed 20 characters");

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Country is required")
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters");
    }
}
