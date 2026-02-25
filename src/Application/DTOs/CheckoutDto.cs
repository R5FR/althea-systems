namespace Application.DTOs;

public class CheckoutDto
{
    public Guid CartId { get; set; }
    public Guid? AddressId { get; set; }
    public Guid? PaymentMethodId { get; set; }
}
