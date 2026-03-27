namespace Application.DTOs;

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPriceHt { get; set; }
    public decimal UnitTvaRate { get; set; }
    public decimal UnitPriceTtc { get; set; }
    public decimal TotalLineHt => UnitPriceHt * Quantity;
    public decimal TotalLineTtc => UnitPriceTtc * Quantity;
    public decimal TotalLineTva => (UnitPriceTtc - UnitPriceHt) * Quantity;
}
