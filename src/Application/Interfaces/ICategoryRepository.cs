namespace Application.Interfaces;

using Project.Domain.Entities;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(bool includeInactive = false);
    Task<Category?> GetByIdAsync(Guid id);
    Task<Category?> GetBySlugAsync(string slug);
    Task AddAsync(Category category);
    Task UpdateAsync(Category category);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsBySlugAsync(string slug);
    Task<int> GetProductCountAsync(Guid categoryId);
}
