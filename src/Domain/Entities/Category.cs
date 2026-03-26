using System;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class Category
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public string Description { get; private set; }
        public string ImageUrl { get; private set; }
        public string Slug { get; private set; }
        public Category? Parent { get; private set; }
        public int DisplayOrder { get; private set; }
        public Enums.CategoryStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        private Category() { } // For EF Core

        public Category(Guid id, string name, string description, string imageUrl, string slug, Category? parent = null, int displayOrder = 0)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(name)) throw new ValidationException("Name is required");
            Id = id;
            Name = name.Trim();
            Description = description?.Trim() ?? string.Empty;
            ImageUrl = imageUrl?.Trim() ?? string.Empty;
            Slug = slug?.Trim() ?? string.Empty;
            Parent = parent;
            DisplayOrder = displayOrder;
            Status = Enums.CategoryStatus.Active;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void Update(string name, string description, string imageUrl, string slug, int displayOrder)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new ValidationException("Name is required");
            Name = name.Trim();
            Description = description?.Trim() ?? string.Empty;
            ImageUrl = imageUrl?.Trim() ?? string.Empty;
            Slug = slug?.Trim() ?? string.Empty;
            DisplayOrder = displayOrder;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetStatus(Enums.CategoryStatus status)
        {
            Status = status;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
