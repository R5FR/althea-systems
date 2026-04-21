namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class ChatMessageRepository : IChatMessageRepository
{
    private readonly AppDbContext _context;

    public ChatMessageRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ChatMessage>> GetByUserIdAsync(Guid userId, int limit = 50)
    {
        return await _context.ChatMessages
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(ChatMessage message)
    {
        await _context.ChatMessages.AddAsync(message);
    }
}
