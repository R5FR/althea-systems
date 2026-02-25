namespace Application.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
