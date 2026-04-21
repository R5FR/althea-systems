namespace Application.Interfaces;

using Project.Domain.Entities;

public interface IProductImageRepository
{
    Task<List<ProductImage>> GetByProductIdAsync(Guid productId);
    Task<ProductImage?> GetByIdAsync(Guid id);
    Task AddAsync(ProductImage image);
    Task DeleteAsync(Guid id);
}
