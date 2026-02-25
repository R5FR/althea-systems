using System;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class ProductImage
    {
        public Guid Id { get; private set; }
        public Product Product { get; private set; }
        public string ImageUrl { get; private set; }
        public bool IsMain { get; private set; }
        public int DisplayOrder { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public ProductImage(Guid id, Product product, string imageUrl, bool isMain = false, int displayOrder = 0)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(imageUrl)) throw new ValidationException("ImageUrl is required");
            Id = id;
            Product = product ?? throw new ValidationException("Product is required");
            ImageUrl = imageUrl.Trim();
            IsMain = isMain;
            DisplayOrder = displayOrder;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
