namespace Application.Interfaces;

using Project.Domain.Entities;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByPasswordResetTokenAsync(string token);
    Task<User?> GetByEmailConfirmationTokenAsync(string token);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsByEmailAsync(string email);
    Task<List<User>> GetAllAsync(int skip = 0, int take = 100, string? search = null);
    Task<int> CountAsync(string? search = null);
}
