namespace Application.DTOs;

public class UpdateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PriceHt { get; set; }
    public decimal VatRate { get; set; }
    public Guid CategoryId { get; set; }
    public string? Slug { get; set; }
    public bool IsActive { get; set; } = true;
    public int Stock { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}
