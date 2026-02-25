namespace Application.DTOs;

public class OrderDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
