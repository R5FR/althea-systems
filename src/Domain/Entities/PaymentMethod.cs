using System;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class PaymentMethod
    {
        public Guid Id { get; private set; }
        public string Provider { get; private set; }
        public string CardBrand { get; private set; }
        public string Last4 { get; private set; }
        public int ExpMonth { get; private set; }
        public int ExpYear { get; private set; }
        public string Token { get; private set; }
        public bool IsDefault { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public PaymentMethod(Guid id, string provider, string cardBrand, string last4, int expMonth, int expYear, string token, bool isDefault = false)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(provider)) throw new ValidationException("Provider is required");
            if (string.IsNullOrWhiteSpace(last4) || last4.Length != 4) throw new ValidationException("Last4 must be 4 digits");

            Id = id;
            Provider = provider.Trim();
            CardBrand = cardBrand?.Trim() ?? string.Empty;
            Last4 = last4;
            ExpMonth = expMonth;
            ExpYear = expYear;
            Token = token ?? string.Empty;
            IsDefault = isDefault;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void SetDefault(bool isDefault)
        {
            IsDefault = isDefault;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
