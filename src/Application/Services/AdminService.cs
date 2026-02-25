namespace Application.Services;

using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using System.Text;

/// <summary>
/// Implémentation concrète du service d'administration.
/// </summary>
public class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IProductService _productService;

    public AdminService(IUnitOfWork unitOfWork, IMapper mapper, IProductService productService)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _productService = productService ?? throw new ArgumentNullException(nameof(productService));
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
        {
            throw new NotFoundException($"Product with id '{productId}' not found");
        }

        // Calculer la différence et ajuster le stock
        var currentQuantity = product.StockQuantity;
        var difference = newQuantity - currentQuantity;

        if (difference > 0)
        {
            product.IncreaseStock(difference);
        }
        else if (difference < 0)
        {
            product.DecreaseStock(Math.Abs(difference));
        }

        await _unitOfWork.ProductRepository.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<byte[]> ExportProductsCsvAsync()
    {
        // Récupérer tous les produits
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
        // Récupérer les commandes avec filtres de date
        var orders = await _unitOfWork.OrderRepository.SearchAsync(
            null,
            startDate,
            endDate,
            0,
            int.MaxValue);

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
        // Note: Pas de méthode GetAll sur les repositories, adapter selon l'implémentation
        // Pour l'instant, on retourne un placeholder
        throw new NotImplementedException("User export requires a GetAllAsync method on IUserRepository");
    }

    public async Task RestockAlertAsync()
    {
        // Récupérer tous les produits en rupture de stock
        var products = await _unitOfWork.ProductRepository.SearchAsync(null, null, null, null, 0, int.MaxValue);
        var outOfStock = products.Where(p => p.StockQuantity == 0).ToList();

        if (outOfStock.Any())
        {
            // À implémenter: envoyer une alerte (email, webhook, etc.)
            // Pour l'instant, on log juste la liste
            var alertMessage = $"[RESTOCK ALERT] {outOfStock.Count} products out of stock: {string.Join(", ", outOfStock.Select(p => p.Name))}";
            System.Diagnostics.Debug.WriteLine(alertMessage);
        }
    }

    /// <summary>
    /// Échappe les valeurs CSV pour éviter les guillemets et sauts de ligne.
    /// </summary>
    private static string EscapeCsv(string value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;
        return value.Replace("\"", "\"\"");
    }
}
