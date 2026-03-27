namespace Application.Services;

using Application.DTOs;
using Project.Domain.Exceptions;

/// <summary>
/// Service d'administration.
/// Lève des exceptions du Domain:
/// - NotFoundException: si la ressource n'existe pas
/// - ValidationException: si les données sont invalides
/// - ConflictException: si une règle métier est violée
/// </summary>
public interface IAdminService
{
    /// <summary>
    /// Crée un nouveau produit.
    /// </summary>
    /// <exception cref="ValidationException">Si les données du produit sont invalides</exception>
    /// <exception cref="ConflictException">Si le slug existe déjà</exception>
    Task<Guid> CreateProductAsync(CreateProductDto dto);

    /// <summary>
    /// Met à jour un produit.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    /// <exception cref="ValidationException">Si les données sont invalides</exception>
    Task UpdateProductAsync(Guid id, UpdateProductDto dto);

    /// <summary>
    /// Supprime un produit.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    Task DeleteProductAsync(Guid id);

    /// <summary>
    /// Met à jour le stock d'un produit.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    /// <exception cref="ValidationException">Si la quantité est invalide</exception>
    Task UpdateStockAsync(Guid productId, int newQuantity);

    /// <summary>
    /// Exporte la liste des produits en CSV.
    /// </summary>
    Task<byte[]> ExportProductsCsvAsync();

    /// <summary>
    /// Exporte la liste des commandes en CSV.
    /// </summary>
    Task<byte[]> ExportOrdersCsvAsync(DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// Exporte la liste des utilisateurs en CSV.
    /// </summary>
    Task<byte[]> ExportUsersCsvAsync();

    /// <summary>
    /// Envoie une alerte de restockage pour les produits en rupture.
    /// </summary>
    Task RestockAlertAsync();

    /// <summary>
    /// Retourne les statistiques du tableau de bord.
    /// </summary>
    Task<DashboardStatsDto> GetDashboardStatsAsync();

    /// <summary>
    /// Retourne la liste paginée des utilisateurs avec recherche optionnelle.
    /// </summary>
    Task<List<AdminUserDto>> GetUsersAsync(string? search = null, int page = 1, int pageSize = 25);

    /// <summary>
    /// Retourne le nombre total d'utilisateurs pour la pagination.
    /// </summary>
    Task<int> GetUsersTotalCountAsync(string? search = null);

    /// <summary>
    /// Désactive un compte utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur n'existe pas</exception>
    Task DisableUserAsync(Guid userId);

    /// <summary>
    /// Active un compte utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur n'existe pas</exception>
    Task EnableUserAsync(Guid userId);

    /// <summary>
    /// Retourne la liste paginée des commandes avec filtres optionnels.
    /// </summary>
    Task<List<AdminOrderDto>> GetOrdersAsync(string? search = null, string? status = null, int page = 1, int pageSize = 25);

    /// <summary>
    /// Retourne le nombre total de commandes pour la pagination.
    /// </summary>
    Task<int> GetOrdersTotalCountAsync(string? search = null, string? status = null);

    /// <summary>
    /// Met à jour le statut d'une commande.
    /// </summary>
    /// <exception cref="NotFoundException">Si la commande n'existe pas</exception>
    /// <exception cref="ValidationException">Si le statut est invalide</exception>
    Task UpdateOrderStatusAsync(Guid orderId, string newStatus);

    /// <summary>
    /// Retourne la liste des catégories pour l'administration.
    /// </summary>
    Task<List<CategoryDto>> GetCategoriesAdminAsync();
}

public class DashboardStatsDto
{
    public decimal RevenueToday { get; set; }
    public decimal RevenueThisWeek { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public int OrdersToday { get; set; }
    public int LowStockCount { get; set; }
    public int UnreadMessagesCount { get; set; }
}

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AccountStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int OrderCount { get; set; }
}

public class AdminOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
