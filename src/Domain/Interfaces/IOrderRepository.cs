using System;
using System.Threading.Tasks;
using Project.Domain.Entities;

namespace Project.Domain.Interfaces
{
    public interface IOrderRepository : IRepository<Order>
    {
        Task<Order?> GetByOrderNumberAsync(string orderNumber);
    }
}
