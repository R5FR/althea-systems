using System;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class CartItem
    {
        public Guid Id { get; private set; }
        public Cart Cart { get; private set; }
        public Product Product { get; private set; }
        public int Quantity { get; private set; }
        public decimal UnitPriceTtc { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        private CartItem() { } // For EF Core

        public CartItem(Guid id, Cart cart, Product product, int quantity, decimal unitPriceTtc)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (quantity <= 0) throw new ValidationException("Quantity must be positive");
            if (unitPriceTtc < 0) throw new ValidationException("UnitPriceTtc cannot be negative");

            Id = id;
            Cart = cart ?? throw new ValidationException("Cart is required");
            Product = product ?? throw new ValidationException("Product is required");
            Quantity = quantity;
            UnitPriceTtc = unitPriceTtc;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void UpdateQuantity(int quantity)
        {
            if (quantity <= 0) throw new ValidationException("Quantity must be positive");
            Quantity = quantity;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
