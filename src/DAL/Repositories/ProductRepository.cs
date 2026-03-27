namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetByIdAsync(Guid id)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<Product>> SearchAsync(string? searchTerm, Guid? categoryId, decimal? minPrice, decimal? maxPrice, int skip, int take)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) || p.Description.ToLower().Contains(term));
        }

        if (categoryId.HasValue)
            query = query.Where(p => EF.Property<Guid>(p, "CategoryId") == categoryId.Value);

        if (minPrice.HasValue)
            query = query.Where(p => p.PriceTtc >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.PriceTtc <= maxPrice.Value);

        return await query
            .Skip(skip)
            .Take(take)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .ToListAsync();
    }

    public async Task<int> CountAsync(string? searchTerm, Guid? categoryId, decimal? minPrice, decimal? maxPrice)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) || p.Description.ToLower().Contains(term));
        }

        if (categoryId.HasValue)
            query = query.Where(p => EF.Property<Guid>(p, "CategoryId") == categoryId.Value);

        if (minPrice.HasValue)
            query = query.Where(p => p.PriceTtc >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.PriceTtc <= maxPrice.Value);

        return await query.CountAsync();
    }

    public async Task<Product?> GetBySlugAsync(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new ValidationException("Slug cannot be null or empty");

        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Slug == slug);
    }

    public async Task<List<Product>> GetTopProductsAsync(int limit)
    {
        if (limit < 1)
            throw new ValidationException("Limit must be greater than 0");

        return await _context.Products
            .OrderByDescending(p => p.CreatedAt)
            .Take(limit)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .ToListAsync();
    }

    public async Task AddAsync(Product product)
    {
        if (product == null)
            throw new ValidationException("Product cannot be null");

        var existingSlug = await _context.Products.FirstOrDefaultAsync(p => p.Slug == product.Slug);
        if (existingSlug != null)
            throw new ConflictException($"Product with slug '{product.Slug}' already exists");

        await _context.Products.AddAsync(product);
    }

    public Task UpdateAsync(Product product)
    {
        if (product == null)
            throw new ValidationException("Product cannot be null");

        _context.Products.Update(product);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var product = await GetByIdAsync(id);
        if (product == null)
            throw new NotFoundException($"Product with ID '{id}' not found");

        _context.Products.Remove(product);
    }
}
