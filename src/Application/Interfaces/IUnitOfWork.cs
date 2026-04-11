namespace Application.Interfaces;

public interface IUnitOfWork : IAsyncDisposable
{
    IUserRepository UserRepository { get; }
    IProductRepository ProductRepository { get; }
    ICartRepository CartRepository { get; }
    IOrderRepository OrderRepository { get; }
    IInvoiceRepository InvoiceRepository { get; }
    ICategoryRepository CategoryRepository { get; }
    IContactMessageRepository ContactRepository { get; }
    IProductImageRepository ProductImageRepository { get; }
    IChatMessageRepository ChatMessageRepository { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
}
