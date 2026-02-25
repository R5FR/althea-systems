namespace Application.DTOs;

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PriceHt { get; set; }
    public decimal TvaRate { get; set; }
    public string? Slug { get; set; }
    public Guid CategoryId { get; set; }
}
