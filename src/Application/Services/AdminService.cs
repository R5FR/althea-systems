namespace Application.Services;

using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using System.Text;
using System.Linq;

/// <summary>
/// Implémentation concrète du service d'administration.
/// </summary>
public class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IProductService _productService;
    private readonly ICategoryService _categoryService;

    public AdminService(IUnitOfWork unitOfWork, IMapper mapper, IProductService productService, ICategoryService categoryService)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _productService = productService ?? throw new ArgumentNullException(nameof(productService));
        _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
    }

    public async Task<Guid> CreateProductAsync(CreateProductDto dto)
    {
        return await _productService.CreateAsync(dto);
    }

    public async Task UpdateProductAsync(Guid id, UpdateProductDto dto)
    {
        await _productService.UpdateAsync(id, dto);
    }

    public async Task DeleteProductAsync(Guid id)
    {
        await _productService.DeleteAsync(id);
    }

    public async Task UpdateStockAsync(Guid productId, int newQuantity)
    {
        if (productId == Guid.Empty) throw new ArgumentException("ProductId cannot be empty", nameof(productId));
        if (newQuantity < 0) throw new ValidationException("Stock quantity cannot be negative");

        var product = await _unitOfWork.ProductRepository.GetByIdAsync(productId);
        if (product == null)
            throw new NotFoundException($"Product with id '{productId}' not found");

        var difference = newQuantity - product.StockQuantity;
        if (difference > 0)
            product.IncreaseStock(difference);
        else if (difference < 0)
            product.DecreaseStock(Math.Abs(difference));

        await _unitOfWork.ProductRepository.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var weekStart = todayStart.AddDays(-(int)now.DayOfWeek);
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var ordersToday = await _unitOfWork.OrderRepository.SearchAsync(null, todayStart, null, 0, int.MaxValue);
        var ordersWeek = await _unitOfWork.OrderRepository.SearchAsync(null, weekStart, null, 0, int.MaxValue);
        var ordersMonth = await _unitOfWork.OrderRepository.SearchAsync(null, monthStart, null, 0, int.MaxValue);

        var allProducts = await _unitOfWork.ProductRepository.SearchAsync(null, null, null, null, 0, int.MaxValue);
        var lowStockCount = allProducts.Count(p => p.StockQuantity <= 5);

        var unreadMessages = await _unitOfWork.ContactRepository.GetUnreadCountAsync();

        return new DashboardStatsDto
        {
            RevenueToday = ordersToday.Sum(o => o.TotalTtc),
            RevenueThisWeek = ordersWeek.Sum(o => o.TotalTtc),
            RevenueThisMonth = ordersMonth.Sum(o => o.TotalTtc),
            OrdersToday = ordersToday.Count,
            LowStockCount = lowStockCount,
            UnreadMessagesCount = unreadMessages
        };
    }

    public async Task<List<AdminUserDto>> GetUsersAsync(string? search = null, int page = 1, int pageSize = 25)
    {
        var skip = (page - 1) * pageSize;
        var users = await _unitOfWork.UserRepository.GetAllAsync(skip, pageSize, search);

        return users.Select(u => new AdminUserDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email.Value,
            AccountStatus = u.AccountStatus.ToString(),
            CreatedAt = u.CreatedAt,
            LastLoginAt = u.LastLoginAt,
            OrderCount = 0 // simplified — no eager-loaded orders
        }).ToList();
    }

    public async Task<int> GetUsersTotalCountAsync(string? search = null)
    {
        return await _unitOfWork.UserRepository.CountAsync(search);
    }

    public async Task DisableUserAsync(Guid userId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with id '{userId}' not found");

        user.Deactivate();
        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task EnableUserAsync(Guid userId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with id '{userId}' not found");

        user.Activate();
        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<AdminOrderDto>> GetOrdersAsync(string? search = null, string? status = null, int page = 1, int pageSize = 25)
    {
        var skip = (page - 1) * pageSize;
        var orders = await _unitOfWork.OrderRepository.SearchAsync(status, null, null, skip, pageSize);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            orders = orders.Where(o =>
                o.OrderNumber.ToLower().Contains(term) ||
                o.User.Email.Value.ToLower().Contains(term) ||
                o.User.FirstName.ToLower().Contains(term) ||
                o.User.LastName.ToLower().Contains(term)).ToList();
        }

        return orders.Select(o => new AdminOrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerEmail = o.User.Email.Value,
            CustomerName = $"{o.User.FirstName} {o.User.LastName}",
            TotalAmount = o.TotalTtc,
            Status = o.Status.ToString(),
            PaymentStatus = o.PaymentStatus.ToString(),
            CreatedAt = o.CreatedAt
        }).ToList();
    }

    public async Task<int> GetOrdersTotalCountAsync(string? search = null, string? status = null)
    {
        return await _unitOfWork.OrderRepository.CountSearchAsync(status, null, null);
    }

    public async Task UpdateOrderStatusAsync(Guid orderId, string newStatus)
    {
        if (orderId == Guid.Empty) throw new ArgumentException("OrderId cannot be empty", nameof(orderId));
        if (string.IsNullOrWhiteSpace(newStatus)) throw new ValidationException("Status is required");

        if (!Enum.TryParse<Project.Domain.Enums.OrderStatus>(newStatus, ignoreCase: true, out var statusEnum))
            throw new ValidationException($"Invalid order status '{newStatus}'");

        var order = await _unitOfWork.OrderRepository.GetByIdAsync(orderId);
        if (order == null)
            throw new NotFoundException($"Order with id '{orderId}' not found");

        order.UpdateStatus(statusEnum);
        await _unitOfWork.OrderRepository.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<CategoryDto>> GetCategoriesAdminAsync()
    {
        return await _categoryService.GetAllAsync(includeInactive: true);
    }

    public async Task<byte[]> ExportProductsCsvAsync()
    {
        var products = await _unitOfWork.ProductRepository.SearchAsync(null, null, null, null, 0, int.MaxValue);

        var csv = new StringBuilder();
        csv.AppendLine("Id,Name,Description,PriceHt,TvaRate,PriceTtc,StockQuantity,Status,Slug,CreatedAt,UpdatedAt");

        foreach (var product in products)
        {
            csv.AppendLine($"\"{product.Id}\",\"{EscapeCsv(product.Name)}\",\"{EscapeCsv(product.Description)}\",{product.PriceHt},{product.TvaRate},{product.PriceTtc},{product.StockQuantity},\"{product.Status}\",\"{product.Slug}\",{product.CreatedAt:yyyy-MM-dd HH:mm:ss},{product.UpdatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<byte[]> ExportOrdersCsvAsync(DateTime? startDate, DateTime? endDate)
    {
        var orders = await _unitOfWork.OrderRepository.SearchAsync(null, startDate, endDate, 0, int.MaxValue);

        var csv = new StringBuilder();
        csv.AppendLine("OrderNumber,UserId,UserEmail,TotalHt,TotalTva,TotalTtc,Status,PaymentStatus,CreatedAt,UpdatedAt");

        foreach (var order in orders)
        {
            csv.AppendLine($"\"{order.OrderNumber}\",\"{order.User.Id}\",\"{EscapeCsv(order.User.Email.Value)}\",{order.TotalHt},{order.TotalTva},{order.TotalTtc},\"{order.Status}\",\"{order.PaymentStatus}\",{order.CreatedAt:yyyy-MM-dd HH:mm:ss},{order.UpdatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<byte[]> ExportUsersCsvAsync()
    {
        var users = await _unitOfWork.UserRepository.GetAllAsync(0, int.MaxValue);

        var csv = new StringBuilder();
        csv.AppendLine("Id,FirstName,LastName,Email,AccountStatus,Role,CreatedAt,LastLoginAt");

        foreach (var user in users)
        {
            csv.AppendLine($"\"{user.Id}\",\"{EscapeCsv(user.FirstName)}\",\"{EscapeCsv(user.LastName)}\",\"{EscapeCsv(user.Email.Value)}\",\"{user.AccountStatus}\",\"{user.Role}\",{user.CreatedAt:yyyy-MM-dd HH:mm:ss},{user.LastLoginAt:yyyy-MM-dd HH:mm:ss}");
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task RestockAlertAsync()
    {
        var products = await _unitOfWork.ProductRepository.SearchAsync(null, null, null, null, 0, int.MaxValue);
        var outOfStock = products.Where(p => p.StockQuantity == 0).ToList();

        if (outOfStock.Any())
        {
            var alertMessage = $"[RESTOCK ALERT] {outOfStock.Count} products out of stock: {string.Join(", ", outOfStock.Select(p => p.Name))}";
            System.Diagnostics.Debug.WriteLine(alertMessage);
        }
    }

    private static string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        return value.Replace("\"", "\"\"");
    }
}
