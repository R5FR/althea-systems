namespace Application.Services;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;

/// <summary>
/// Implémentation concrète du service de gestion des catégories.
/// </summary>
public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<List<CategoryDto>> GetAllAsync(bool includeInactive = false)
    {
        var categories = await _unitOfWork.CategoryRepository.GetAllAsync(includeInactive);
        var result = new List<CategoryDto>();

        foreach (var category in categories)
        {
            var productCount = await _unitOfWork.CategoryRepository.GetProductCountAsync(category.Id);
            result.Add(MapToDto(category, productCount));
        }

        return result;
    }

    public async Task<CategoryDto?> GetBySlugAsync(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug)) throw new ValidationException("Slug is required");

        var category = await _unitOfWork.CategoryRepository.GetBySlugAsync(slug);
        if (category == null) return null;

        var productCount = await _unitOfWork.CategoryRepository.GetProductCountAsync(category.Id);
        return MapToDto(category, productCount);
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));

        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(id);
        if (category == null) return null;

        var productCount = await _unitOfWork.CategoryRepository.GetProductCountAsync(category.Id);
        return MapToDto(category, productCount);
    }

    public async Task<Guid> CreateAsync(CreateCategoryDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new ValidationException("Name is required");

        // Generate slug from name if not provided
        var slug = !string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Slug.Trim().ToLowerInvariant()
            : GenerateSlug(dto.Name);

        // Check slug uniqueness
        var slugExists = await _unitOfWork.CategoryRepository.ExistsBySlugAsync(slug);
        if (slugExists)
            throw new ConflictException($"Category with slug '{slug}' already exists");

        var category = new Category(
            Guid.NewGuid(),
            dto.Name,
            dto.Description ?? string.Empty,
            dto.ImageUrl ?? string.Empty,
            slug,
            null,
            dto.DisplayOrder);

        await _unitOfWork.CategoryRepository.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return category.Id;
    }

    public async Task UpdateAsync(Guid id, CreateCategoryDto dto)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));
        if (dto == null) throw new ArgumentNullException(nameof(dto));

        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(id);
        if (category == null)
            throw new NotFoundException($"Category with id '{id}' not found");

        var slug = !string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Slug.Trim().ToLowerInvariant()
            : GenerateSlug(dto.Name);

        // Check slug uniqueness only if slug changed
        if (slug != category.Slug)
        {
            var slugExists = await _unitOfWork.CategoryRepository.ExistsBySlugAsync(slug);
            if (slugExists)
                throw new ConflictException($"Category with slug '{slug}' already exists");
        }

        category.Update(
            dto.Name,
            dto.Description ?? string.Empty,
            dto.ImageUrl ?? string.Empty,
            slug,
            dto.DisplayOrder);

        await _unitOfWork.CategoryRepository.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));

        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(id);
        if (category == null)
            throw new NotFoundException($"Category with id '{id}' not found");

        var productCount = await _unitOfWork.CategoryRepository.GetProductCountAsync(id);
        if (productCount > 0)
            throw new ConflictException($"Cannot delete category '{category.Name}' because it has {productCount} product(s) associated");

        await _unitOfWork.CategoryRepository.DeleteAsync(id);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task SetStatusAsync(Guid id, bool active)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));

        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(id);
        if (category == null)
            throw new NotFoundException($"Category with id '{id}' not found");

        category.SetStatus(active
            ? Project.Domain.Enums.CategoryStatus.Active
            : Project.Domain.Enums.CategoryStatus.Inactive);

        await _unitOfWork.CategoryRepository.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }

    private static CategoryDto MapToDto(Category category, int productCount = 0)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            Slug = category.Slug,
            DisplayOrder = category.DisplayOrder,
            Status = category.Status.ToString(),
            ProductCount = productCount
        };
    }

    private static string GenerateSlug(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return string.Empty;

        var slug = name.ToLowerInvariant();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^\w\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[\s_-]+", "-");
        slug = slug.Trim('-');

        return slug;
    }
}
