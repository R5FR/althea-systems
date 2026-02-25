using System;
using System.Collections.Generic;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class Cart
    {
        public Guid Id { get; private set; }
        public User? User { get; private set; }
        public string? SessionId { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        private readonly List<CartItem> _items = new();
        public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();

        public Cart(Guid id, User? user = null, string? sessionId = null)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            Id = id;
            User = user;
            SessionId = sessionId;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void AddItem(CartItem item)
        {
            if (item == null) throw new ValidationException("CartItem cannot be null");
            _items.Add(item);
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemoveItem(Guid itemId)
        {
            var it = _items.Find(i => i.Id == itemId);
            if (it == null) throw new NotFoundException("CartItem not found");
            _items.Remove(it);
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
