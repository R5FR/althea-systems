namespace Application.DTOs;

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceTtc { get; set; }
    public decimal Total => UnitPriceTtc * Quantity;
}
