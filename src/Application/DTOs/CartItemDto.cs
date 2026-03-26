namespace Application.DTOs;

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceTtc { get; set; }
    public decimal UnitPriceHt { get; set; }
    public decimal TvaRate { get; set; }
    public decimal Total => UnitPriceTtc * Quantity;
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; }
}
