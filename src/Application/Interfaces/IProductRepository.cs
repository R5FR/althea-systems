namespace Application.Interfaces;

using Project.Domain.Entities;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id);
    Task<List<Product>> SearchAsync(string? searchTerm, Guid? categoryId, decimal? minPrice, decimal? maxPrice, bool onlyAvailable, string sortBy, string sortDir, int skip, int take);
    Task<int> CountAsync(string? searchTerm, Guid? categoryId, decimal? minPrice, decimal? maxPrice, bool onlyAvailable);
    Task<Product?> GetBySlugAsync(string slug);
    Task<List<Product>> GetTopProductsAsync(int limit);
    Task AddAsync(Product product);
    Task UpdateAsync(Product product);
    Task DeleteAsync(Guid id);
}
