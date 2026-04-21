namespace Application.Services;

using Project.Domain.Exceptions;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProductCount { get; set; }
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(bool includeInactive = false);
    Task<CategoryDto?> GetBySlugAsync(string slug);
    Task<CategoryDto?> GetByIdAsync(Guid id);
    Task<Guid> CreateAsync(CreateCategoryDto dto);
    Task UpdateAsync(Guid id, CreateCategoryDto dto);
    Task DeleteAsync(Guid id);
    Task SetStatusAsync(Guid id, bool active);
}
