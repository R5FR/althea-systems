namespace Application.Interfaces;

using Application.DTOs;

public interface IInvoiceService
{
    Task<InvoiceDto> GenerateInvoiceAsync(Guid orderId);
    Task<InvoiceDto?> GetInvoiceByOrderIdAsync(Guid orderId, Guid callerUserId);
    Task<InvoiceDto> GetInvoiceAsync(Guid invoiceId, Guid callerUserId);
    Task<List<InvoiceDto>> GetUserInvoicesAsync(Guid userId);
    Task<List<InvoiceDto>> GetAllInvoicesAsync();
    Task UpdateInvoiceStatusAsync(Guid invoiceId, string status);
}
