namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllAsync(bool includeInactive = false)
    {
        var query = _context.Categories.AsQueryable();

        if (!includeInactive)
            query = query.Where(c => c.Status == Project.Domain.Enums.CategoryStatus.Active);

        return await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(Guid id)
    {
        return await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Category?> GetBySlugAsync(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ValidationException("Slug cannot be null or empty");

        return await _context.Categories.FirstOrDefaultAsync(c => c.Slug == slug);
    }

    public async Task AddAsync(Category category)
    {
        if (category == null)
            throw new ValidationException("Category cannot be null");

        var existingSlug = await _context.Categories.FirstOrDefaultAsync(c => c.Slug == category.Slug);
        if (existingSlug != null)
            throw new ConflictException($"Category with slug '{category.Slug}' already exists");

        await _context.Categories.AddAsync(category);
    }

    public Task UpdateAsync(Category category)
    {
        if (category == null)
            throw new ValidationException("Category cannot be null");

        _context.Categories.Update(category);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var category = await GetByIdAsync(id);
        if (category == null)
            throw new NotFoundException($"Category with ID '{id}' not found");

        _context.Categories.Remove(category);
    }

    public async Task<bool> ExistsBySlugAsync(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            return false;

        return await _context.Categories.AnyAsync(c => c.Slug == slug);
    }

    public async Task<int> GetProductCountAsync(Guid categoryId)
    {
        return await _context.Products.CountAsync(p => EF.Property<Guid>(p, "CategoryId") == categoryId);
    }
}
