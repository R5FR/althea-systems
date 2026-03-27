namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdAsync(Guid id)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.User)
            .Include(o => o.BillingAddress)
            .Include(o => o.ShippingAddress)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<List<Order>> GetByUserIdAsync(Guid userId, int skip, int take)
    {
        if (skip < 0) skip = 0;
        if (take < 1) take = 100;

        return await _context.Orders
            .Where(o => EF.Property<Guid>(o, "UserId") == userId)
            .Include(o => o.Items)
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountByUserIdAsync(Guid userId)
    {
        return await _context.Orders.CountAsync(o => EF.Property<Guid>(o, "UserId") == userId);
    }

    public async Task<List<Order>> SearchAsync(string? status, DateTime? startDate, DateTime? endDate, int skip, int take)
    {
        if (skip < 0) skip = 0;
        if (take < 1) take = 100;

        var query = _context.Orders.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(o => o.Status.ToString() == status);

        if (startDate.HasValue)
            query = query.Where(o => o.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(o => o.CreatedAt <= endDate.Value);

        return await query
            .Skip(skip)
            .Take(take)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> CountSearchAsync(string? status, DateTime? startDate, DateTime? endDate)
    {
        var query = _context.Orders.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(o => o.Status.ToString() == status);

        if (startDate.HasValue)
            query = query.Where(o => o.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(o => o.CreatedAt <= endDate.Value);

        return await query.CountAsync();
    }

    public async Task AddAsync(Order order)
    {
        if (order == null)
            throw new ValidationException("Order cannot be null");

        await _context.Orders.AddAsync(order);
    }

    public Task UpdateAsync(Order order)
    {
        if (order == null)
            throw new ValidationException("Order cannot be null");

        _context.Orders.Update(order);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var order = await GetByIdAsync(id);
        if (order == null)
            throw new NotFoundException($"Order with ID '{id}' not found");

        _context.Orders.Remove(order);
    }
}
