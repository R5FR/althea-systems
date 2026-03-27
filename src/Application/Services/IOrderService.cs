namespace Application.Services;

using Application.DTOs;
using Project.Domain.Exceptions;

/// <summary>
/// Service de gestion des commandes.
/// Lève des exceptions du Domain:
/// - NotFoundException: si la commande n'existe pas
/// - UnauthorizedException: si l'utilisateur n'a pas accès à la commande
/// - ValidationException: si les données sont invalides
/// - ConflictException: si une règle métier est violée
/// </summary>
public interface IOrderService
{
    /// <summary>
    /// Crée une nouvelle commande depuis le panier.
    /// </summary>
    /// <exception cref="ValidationException">Si le panier est vide ou invalide</exception>
    /// <exception cref="ConflictException">Si une règle métier est violée</exception>
    Task<Guid> PlaceOrderAsync(CheckoutDto dto, Guid userId);

    /// <summary>
    /// Récupère une commande par ID.
    /// </summary>
    /// <exception cref="NotFoundException">Si la commande n'existe pas</exception>
    /// <exception cref="UnauthorizedException">Si l'utilisateur n'a pas le droit d'accéder à cette commande</exception>
    Task<OrderDto> GetOrderAsync(Guid orderId, Guid callerUserId);

    /// <summary>
    /// Liste les commandes d'un utilisateur.
    /// </summary>
    Task<PaginatedResult<OrderDto>> ListOrdersAsync(Guid userId, OrderFilterParams filterParams);

    /// <summary>
    /// Annule une commande.
    /// </summary>
    /// <exception cref="NotFoundException">Si la commande n'existe pas</exception>
    /// <exception cref="UnauthorizedException">Si l'utilisateur n'a pas le droit</exception>
    /// <exception cref="ConflictException">Si la commande ne peut pas être annulée</exception>
    Task CancelOrderAsync(Guid orderId, Guid callerUserId);

    /// <summary>
    /// Exporte une commande dans le format spécifié.
    /// </summary>
    /// <exception cref="NotFoundException">Si la commande n'existe pas</exception>
    /// <exception cref="UnauthorizedException">Si l'utilisateur n'a pas le droit</exception>
    /// <exception cref="ValidationException">Si le format n'est pas supporté</exception>
    Task<byte[]> ExportOrderAsync(Guid orderId, Guid callerUserId, string format);
}

public class OrderFilterParams
{
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "createdAt";
}
