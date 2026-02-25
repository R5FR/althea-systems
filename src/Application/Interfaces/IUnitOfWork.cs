namespace Application.Interfaces;

public interface IUnitOfWork : IAsyncDisposable
{
    IUserRepository UserRepository { get; }
    IProductRepository ProductRepository { get; }
    ICartRepository CartRepository { get; }
    IOrderRepository OrderRepository { get; }
    IInvoiceRepository InvoiceRepository { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
}
