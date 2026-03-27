using System;
using System.Threading.Tasks;
using Project.Domain.Entities;

namespace Project.Domain.Interfaces
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<Product?> GetBySlugAsync(string slug);
    }
}
