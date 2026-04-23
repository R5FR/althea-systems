namespace Application.Interfaces;

using Project.Domain.Entities;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(Guid id);
    Task<Invoice?> GetByIdWithDetailsAsync(Guid id);
    Task<List<Invoice>> GetByUserIdAsync(Guid userId);
    Task<Invoice?> GetByOrderIdAsync(Guid orderId);
    Task<List<Invoice>> GetAllAsync();
    Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber);
    Task<int> CountAsync();
    Task AddAsync(Invoice invoice);
    Task UpdateAsync(Invoice invoice);
    Task DeleteAsync(Guid id);
}
