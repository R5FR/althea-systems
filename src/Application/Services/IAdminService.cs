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
}

