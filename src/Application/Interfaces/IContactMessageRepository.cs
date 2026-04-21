namespace Application.Interfaces;

using Project.Domain.Entities;

public interface IContactMessageRepository
{
    Task<List<ContactMessage>> GetAllAsync(bool unreadOnly = false);
    Task<ContactMessage?> GetByIdAsync(Guid id);
    Task AddAsync(ContactMessage message);
    Task UpdateAsync(ContactMessage message);
    Task<int> GetUnreadCountAsync();
}
