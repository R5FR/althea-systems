namespace Application.DTOs;

public class CartDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? SessionId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal Total { get; set; }
    public decimal TotalTtc { get; set; }
    public decimal SubtotalHt { get; set; }
    public decimal TotalTva { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
