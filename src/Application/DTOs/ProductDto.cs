namespace Application.DTOs;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PriceHt { get; set; }
    public decimal TvaRate { get; set; }
    public decimal PriceTtc { get; set; }
    public int StockQuantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
