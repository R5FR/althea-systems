namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly AppDbContext _context;

    public InvoiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Invoice?> GetByIdAsync(Guid id)
    {
        return await _context.Invoices
            .Include(i => i.Order)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Invoice?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Invoices
            .Include(i => i.Order).ThenInclude(o => o.Items)
            .Include(i => i.Order).ThenInclude(o => o.BillingAddress)
            .Include(i => i.Order).ThenInclude(o => o.ShippingAddress)
            .Include(i => i.Order).ThenInclude(o => o.User)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<List<Invoice>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Invoices
            .Include(i => i.Order)
            .Where(i => EF.Property<Guid>(i, "UserId") == userId)
            .OrderByDescending(i => i.IssuedAt)
            .ToListAsync();
    }

    public async Task<Invoice?> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.Invoices
            .Include(i => i.Order)
            .FirstOrDefaultAsync(i => EF.Property<Guid>(i, "OrderId") == orderId);
    }

    public async Task<List<Invoice>> GetAllAsync()
    {
        return await _context.Invoices
            .Include(i => i.Order)
            .Include(i => i.User)
            .OrderByDescending(i => i.IssuedAt)
            .ToListAsync();
    }

    public async Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber)
    {
        return await _context.Invoices
            .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);
    }

    public async Task<int> CountAsync()
    {
        return await _context.Invoices.CountAsync();
    }

    public async Task AddAsync(Invoice invoice)
    {
        if (invoice == null)
            throw new ValidationException("Invoice cannot be null");

        var exists = await _context.Invoices
            .AnyAsync(i => EF.Property<Guid>(i, "OrderId") == invoice.Order.Id);
        if (exists)
            throw new ConflictException("Invoice for this order already exists");

        await _context.Invoices.AddAsync(invoice);
    }

    public Task UpdateAsync(Invoice invoice)
    {
        if (invoice == null)
            throw new ValidationException("Invoice cannot be null");

        _context.Invoices.Update(invoice);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var invoice = await GetByIdAsync(id);
        if (invoice == null)
            throw new NotFoundException($"Invoice with ID '{id}' not found");

        _context.Invoices.Remove(invoice);
    }
}
