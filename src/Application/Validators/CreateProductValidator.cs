namespace Application.Validators;

using Application.DTOs;
using FluentValidation;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(255).WithMessage("Name must not exceed 255 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters");

        RuleFor(x => x.PriceHt)
            .GreaterThan(0).WithMessage("PriceHt must be greater than 0");

        RuleFor(x => x.TvaRate)
            .GreaterThanOrEqualTo(0).WithMessage("TvaRate must be greater than or equal to 0")
            .LessThanOrEqualTo(1).WithMessage("TvaRate must be less than or equal to 1");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("StockQuantity must be greater than or equal to 0");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("CategoryId is required");
    }
}
