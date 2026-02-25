namespace Application.Interfaces;

using Project.Domain.Entities;

public interface ICartRepository
{
    Task<Cart?> GetByIdAsync(Guid id);
    Task<Cart?> GetByUserIdAsync(Guid userId);
    Task<Cart?> GetBySessionIdAsync(string sessionId);
    Task AddAsync(Cart cart);
    Task UpdateAsync(Cart cart);
    Task DeleteAsync(Guid id);
}
