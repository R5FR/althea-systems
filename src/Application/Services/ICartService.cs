namespace Application.Services;

using Application.DTOs;
using Project.Domain.Exceptions;

/// <summary>
/// Service de gestion du panier.
/// Lève des exceptions du Domain:
/// - NotFoundException: si le panier ou produit n'existe pas
/// - ValidationException: si les données sont invalides
/// - ConflictException: si le stock est insuffisant
/// </summary>
public interface ICartService
{
    /// <summary>
    /// Récupère le panier d'un utilisateur ou session.
    /// </summary>
    /// <exception cref="NotFoundException">Si le panier n'existe pas</exception>
    Task<CartDto> GetCartAsync(Guid? userId, string? sessionId);

    /// <summary>
    /// Récupère ou crée un panier par son ID (pour les paniers invités via localStorage).
    /// </summary>
    Task<CartDto> GetOrCreateCartAsync(Guid cartId);

    /// <summary>
    /// Ajoute un article au panier.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    /// <exception cref="ValidationException">Si la quantité est invalide</exception>
    /// <exception cref="ConflictException">Si le stock est insuffisant</exception>
    Task AddItemAsync(Guid cartId, Guid productId, int quantity);

    /// <summary>
    /// Met à jour la quantité d'un article du panier.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'article n'existe pas</exception>
    /// <exception cref="ValidationException">Si la quantité est invalide</exception>
    /// <exception cref="ConflictException">Si le stock est insuffisant</exception>
    Task UpdateItemAsync(Guid itemId, int quantity);

    /// <summary>
    /// Supprime un article du panier.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'article n'existe pas</exception>
    Task RemoveItemAsync(Guid itemId);

    /// <summary>
    /// Vide complètement le panier.
    /// </summary>
    /// <exception cref="NotFoundException">Si le panier n'existe pas</exception>
    Task ClearCartAsync(Guid cartId);

    /// <summary>
    /// Valide le panier et crée une commande.
    /// </summary>
    /// <exception cref="ValidationException">Si le panier est vide ou invalide</exception>
    /// <exception cref="ConflictException">Si une règle métier est violée</exception>
    Task<Guid> CheckoutAsync(CheckoutDto dto, Guid userId);
}

