namespace Application.Interfaces;

using Project.Domain.Entities;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(Guid id);
    Task<List<Invoice>> GetByUserIdAsync(Guid userId);
    Task<Invoice?> GetByOrderIdAsync(Guid orderId);
    Task AddAsync(Invoice invoice);
    Task UpdateAsync(Invoice invoice);
    Task DeleteAsync(Guid id);
}
