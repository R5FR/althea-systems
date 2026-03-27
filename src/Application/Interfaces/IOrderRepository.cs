namespace Application.Interfaces;

using Project.Domain.Entities;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id);
    Task<List<Order>> GetByUserIdAsync(Guid userId, int skip, int take);
    Task<int> CountByUserIdAsync(Guid userId);
    Task<List<Order>> SearchAsync(string? status, DateTime? startDate, DateTime? endDate, int skip, int take);
    Task<int> CountSearchAsync(string? status, DateTime? startDate, DateTime? endDate);
    Task AddAsync(Order order);
    Task UpdateAsync(Order order);
    Task DeleteAsync(Guid id);
}
