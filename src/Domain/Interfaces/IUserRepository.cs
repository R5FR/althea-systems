using System;
using System.Threading.Tasks;
using Project.Domain.Entities;

namespace Project.Domain.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
    }
}
