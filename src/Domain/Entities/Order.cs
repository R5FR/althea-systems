using System;
using System.Collections.Generic;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class Order
    {
        public Guid Id { get; private set; }
        public string OrderNumber { get; private set; }
        public User User { get; private set; }
        public Address BillingAddress { get; private set; }
        public Address ShippingAddress { get; private set; }
        public PaymentMethod? PaymentMethod { get; private set; }
        public decimal TotalHt { get; private set; }
        public decimal TotalTva { get; private set; }
        public decimal TotalTtc { get; private set; }
        public Enums.OrderStatus Status { get; private set; }
        public Enums.PaymentStatus PaymentStatus { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

        private List<OrderItem> _items = new();

        private Order() { } // For EF Core

        public Order(Guid id, string orderNumber, User user, Address billingAddress, Address shippingAddress, PaymentMethod paymentMethod)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(orderNumber)) throw new ValidationException("OrderNumber is required");

            Id = id;
            OrderNumber = orderNumber;
            User = user ?? throw new ValidationException("User is required");
            BillingAddress = billingAddress ?? throw new ValidationException("BillingAddress is required");
            ShippingAddress = shippingAddress ?? throw new ValidationException("ShippingAddress is required");
            PaymentMethod = paymentMethod;
            Status = Enums.OrderStatus.Pending;
            PaymentStatus = Enums.PaymentStatus.Pending;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void AddItem(OrderItem item)
        {
            if (item == null) throw new ValidationException("OrderItem cannot be null");
            _items.Add(item);
            RecalculateTotals();
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateStatus(Enums.OrderStatus status)
        {
            Status = status;
            UpdatedAt = DateTime.UtcNow;
        }

        private void RecalculateTotals()
        {
            decimal totalTtc = 0m;
            decimal totalHt = 0m;
            decimal totalTva = 0m;
            foreach (var i in _items)
            {
                totalTtc += i.TotalLineTtc;
                totalHt += i.UnitPriceHt * i.Quantity;
                totalTva += (i.UnitPriceTtc - i.UnitPriceHt) * i.Quantity;
            }
            TotalTtc = totalTtc;
            TotalHt = totalHt;
            TotalTva = totalTva;
        }
    }
}
