namespace Application.DTOs;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public AddressDto? BillingAddress { get; set; }
    public AddressDto? ShippingAddress { get; set; }
    public decimal TotalHt { get; set; }
    public decimal TotalTva { get; set; }
    public decimal TotalTtc { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
