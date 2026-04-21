namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class ProductImageRepository : IProductImageRepository
{
    private readonly AppDbContext _context;

    public ProductImageRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductImage>> GetByProductIdAsync(Guid productId)
    {
        return await _context.ProductImages
            .Where(pi => EF.Property<Guid>(pi, "ProductId") == productId)
            .OrderBy(pi => pi.DisplayOrder)
            .ToListAsync();
    }

    public async Task<ProductImage?> GetByIdAsync(Guid id)
    {
        return await _context.ProductImages.FirstOrDefaultAsync(pi => pi.Id == id);
    }

    public async Task AddAsync(ProductImage image)
    {
        if (image == null)
            throw new ValidationException("ProductImage cannot be null");

        await _context.ProductImages.AddAsync(image);
    }

    public async Task DeleteAsync(Guid id)
    {
        var image = await GetByIdAsync(id);
        if (image == null)
            throw new NotFoundException($"ProductImage with ID '{id}' not found");

        _context.ProductImages.Remove(image);
    }
}
