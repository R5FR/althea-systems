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
        return await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<List<Invoice>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Invoices
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<Invoice?> GetByOrderIdAsync(Guid orderId)
    {
        return await _context.Invoices.FirstOrDefaultAsync(i => i.OrderId == orderId);
    }

    public async Task AddAsync(Invoice invoice)
    {
        if (invoice == null)
            throw new ValidationException("Invoice cannot be null");

        var existingInvoice = await _context.Invoices.FirstOrDefaultAsync(i => i.OrderId == invoice.OrderId);
        if (existingInvoice != null)
            throw new ConflictException($"Invoice for order '{invoice.OrderId}' already exists");

        await _context.Invoices.AddAsync(invoice);
    }

    public void Update(Invoice invoice)
    {
        if (invoice == null)
            throw new ValidationException("Invoice cannot be null");

        _context.Invoices.Update(invoice);
    }

    public async Task DeleteAsync(Guid id)
    {
        var invoice = await GetByIdAsync(id);
        if (invoice == null)
            throw new NotFoundException($"Invoice with ID '{id}' not found");

        _context.Invoices.Remove(invoice);
    }
}
