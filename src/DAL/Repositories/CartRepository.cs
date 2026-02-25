namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;

    public CartRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByIdAsync(Guid id)
    {
        return await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Cart?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    public async Task<Cart?> GetBySessionIdAsync(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new ValidationException("SessionId cannot be null or empty");

        return await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.SessionId == sessionId);
    }

    public async Task AddAsync(Cart cart)
    {
        if (cart == null)
            throw new ValidationException("Cart cannot be null");

        await _context.Carts.AddAsync(cart);
    }

    public void UpdateAsync(Cart cart)
    {
        if (cart == null)
            throw new ValidationException("Cart cannot be null");

        _context.Carts.Update(cart);
    }

    public async Task DeleteAsync(Guid id)
    {
        var cart = await GetByIdAsync(id);
        if (cart == null)
            throw new NotFoundException($"Cart with ID '{id}' not found");

        _context.Carts.Remove(cart);
    }
}
