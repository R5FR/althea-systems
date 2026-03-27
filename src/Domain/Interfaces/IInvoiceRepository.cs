using System;
using System.Threading.Tasks;
using Project.Domain.Entities;

namespace Project.Domain.Interfaces
{
    public interface IInvoiceRepository : IRepository<Invoice>
    {
        Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber);
    }
}
