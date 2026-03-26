namespace Application.DTOs;

public class PaymentMethodDto
{
    public Guid Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string CardBrand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpMonth { get; set; }
    public int ExpYear { get; set; }
    public bool IsDefault { get; set; }
}
