namespace Application.Interfaces;

using Project.Domain.Entities;

public interface IChatMessageRepository
{
    Task<List<ChatMessage>> GetByUserIdAsync(Guid userId, int limit = 50);
    Task AddAsync(ChatMessage message);
}
