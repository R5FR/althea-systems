namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class ContactMessageRepository : IContactMessageRepository
{
    private readonly AppDbContext _context;

    public ContactMessageRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ContactMessage>> GetAllAsync(bool unreadOnly = false)
    {
        var query = _context.ContactMessages.AsQueryable();

        if (unreadOnly)
            query = query.Where(m => m.Status == Project.Domain.Enums.MessageStatus.New);

        return await query
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<ContactMessage?> GetByIdAsync(Guid id)
    {
        return await _context.ContactMessages.FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task AddAsync(ContactMessage message)
    {
        if (message == null)
            throw new ValidationException("ContactMessage cannot be null");

        await _context.ContactMessages.AddAsync(message);
    }

    public Task UpdateAsync(ContactMessage message)
    {
        if (message == null)
            throw new ValidationException("ContactMessage cannot be null");

        _context.ContactMessages.Update(message);
        return Task.CompletedTask;
    }

    public async Task<int> GetUnreadCountAsync()
    {
        return await _context.ContactMessages
            .CountAsync(m => m.Status == Project.Domain.Enums.MessageStatus.New);
    }
}
