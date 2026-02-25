using System;
using System.Threading.Tasks;

namespace Project.Domain.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(Guid id);
        Task AddAsync(T entity);
        void Update(T entity);
    }
}
