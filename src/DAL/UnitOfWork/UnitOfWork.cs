namespace DAL.UnitOfWork;

using Application.Interfaces;
using DAL.Context;
using DAL.Repositories;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private IDbContextTransaction? _transaction;

    private IUserRepository? _userRepository;
    private IProductRepository? _productRepository;
    private ICartRepository? _cartRepository;
    private IOrderRepository? _orderRepository;
    private IInvoiceRepository? _invoiceRepository;
    private ICategoryRepository? _categoryRepository;
    private IContactMessageRepository? _contactRepository;
    private IProductImageRepository? _productImageRepository;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IUserRepository UserRepository => _userRepository ??= new UserRepository(_context);
    public IProductRepository ProductRepository => _productRepository ??= new ProductRepository(_context);
    public ICartRepository CartRepository => _cartRepository ??= new CartRepository(_context);
    public IOrderRepository OrderRepository => _orderRepository ??= new OrderRepository(_context);
    public IInvoiceRepository InvoiceRepository => _invoiceRepository ??= new InvoiceRepository(_context);
    public ICategoryRepository CategoryRepository => _categoryRepository ??= new CategoryRepository(_context);
    public IContactMessageRepository ContactRepository => _contactRepository ??= new ContactMessageRepository(_context);
    public IProductImageRepository ProductImageRepository => _productImageRepository ??= new ProductImageRepository(_context);

    public async Task<int> SaveChangesAsync()
    {
        try
        {
            return await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new DomainException("Concurrency conflict: the data was modified by another user");
        }
        catch (DbUpdateException ex)
        {
            throw new DomainException("An error occurred while saving changes", ex);
        }
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitAsync()
    {
        try
        {
            await SaveChangesAsync();
            if (_transaction != null)
                await _transaction.CommitAsync();
        }
        catch
        {
            await RollbackAsync();
            throw;
        }
        finally
        {
            if (_transaction != null)
                await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync()
    {
        try
        {
            if (_transaction != null)
                await _transaction.RollbackAsync();
        }
        finally
        {
            if (_transaction != null)
                await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction != null)
            await _transaction.DisposeAsync();

        await _context.DisposeAsync();
    }
}
