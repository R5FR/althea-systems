using System;
using System.Threading.Tasks;
using Project.Domain.Entities;

namespace Project.Domain.Interfaces
{
    public interface ICartRepository : IRepository<Cart>
    {
        Task<Cart?> GetBySessionIdAsync(string sessionId);
    }
}
