using System;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class Product
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public string Description { get; private set; }
        public decimal PriceHt { get; private set; }
        public decimal TvaRate { get; private set; }
        public decimal PriceTtc { get; private set; }
        public int StockQuantity { get; private set; }
        public Enums.ProductStatus Status { get; private set; }
        public string Slug { get; private set; }
        public Category Category { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public Product(Guid id, string name, string description, decimal priceHt, decimal tvaRate, int stockQuantity, Category category, string slug)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(name)) throw new ValidationException("Name is required");
            if (priceHt < 0) throw new ValidationException("PriceHt cannot be negative");
            if (tvaRate < 0) throw new ValidationException("TvaRate cannot be negative");
            if (stockQuantity < 0) throw new ValidationException("StockQuantity cannot be negative");

            Id = id;
            Name = name.Trim();
            Description = description?.Trim() ?? string.Empty;
            PriceHt = priceHt;
            TvaRate = tvaRate;
            PriceTtc = Math.Round(priceHt * (1 + tvaRate / 100m), 2);
            StockQuantity = stockQuantity;
            Category = category ?? throw new ValidationException("Category is required");
            Slug = slug?.Trim() ?? string.Empty;
            Status = Enums.ProductStatus.Published;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void DecreaseStock(int qty)
        {
            if (qty <= 0) throw new ValidationException("Quantity must be positive");
            if (qty > StockQuantity) throw new DomainException("Insufficient stock");
            StockQuantity -= qty;
            UpdatedAt = DateTime.UtcNow;
        }

        public void IncreaseStock(int qty)
        {
            if (qty <= 0) throw new ValidationException("Quantity must be positive");
            StockQuantity += qty;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
