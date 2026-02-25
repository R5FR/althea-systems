using System;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class OrderItem
    {
        public Guid Id { get; private set; }
        public Product Product { get; private set; }
        public string ProductNameSnapshot { get; private set; }
        public decimal UnitPriceHt { get; private set; }
        public decimal UnitTvaRate { get; private set; }
        public decimal UnitPriceTtc { get; private set; }
        public int Quantity { get; private set; }
        public decimal TotalLineTtc => UnitPriceTtc * Quantity;
        public DateTime CreatedAt { get; private set; }

        public OrderItem(Guid id, Product product, string productNameSnapshot, decimal unitPriceHt, decimal unitTvaRate, int quantity)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(productNameSnapshot)) throw new ValidationException("ProductNameSnapshot is required");
            if (unitPriceHt < 0) throw new ValidationException("UnitPriceHt cannot be negative");
            if (unitTvaRate < 0) throw new ValidationException("UnitTvaRate cannot be negative");
            if (quantity <= 0) throw new ValidationException("Quantity must be positive");

            Id = id;
            Product = product ?? throw new ValidationException("Product is required");
            ProductNameSnapshot = productNameSnapshot.Trim();
            UnitPriceHt = unitPriceHt;
            UnitTvaRate = unitTvaRate;
            UnitPriceTtc = Math.Round(unitPriceHt * (1 + unitTvaRate / 100m), 2);
            Quantity = quantity;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
