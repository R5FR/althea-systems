namespace Application.DTOs;

public class ProductListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceTtc { get; set; }
    public string Slug { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
}
