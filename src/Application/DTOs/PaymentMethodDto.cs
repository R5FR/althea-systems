namespace Application.DTOs;

public class PaymentMethodDto
{
    public Guid Id { get; set; }
    public string CardType { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
}
