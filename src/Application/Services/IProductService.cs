namespace Application.Services;

using Application.DTOs;
using Project.Domain.Exceptions;

/// <summary>
/// Service de gestion des produits.
/// Lève des exceptions du Domain:
/// - NotFoundException: si le produit n'existe pas
/// - ValidationException: si les données sont invalides
/// - ConflictException: si un conflit métier se produit (ex: stock insuffisant)
/// </summary>
public interface IProductService
{
    /// <summary>
    /// Récupère un produit par son ID.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    Task<ProductDto> GetByIdAsync(Guid id);

    /// <summary>
    /// Récupère un produit par son slug.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    Task<ProductDto> GetBySlugAsync(string slug);

    /// <summary>
    /// Recherche les produits selon les critères.
    /// </summary>
    /// <exception cref="ValidationException">Si les paramètres sont invalides</exception>
    Task<PaginatedResult<ProductListItemDto>> SearchAsync(ProductSearchParams searchParams);

    /// <summary>
    /// Crée un nouveau produit.
    /// </summary>
    /// <exception cref="ValidationException">Si les données du produit sont invalides</exception>
    /// <exception cref="ConflictException">Si le slug existe déjà</exception>
    Task<Guid> CreateAsync(CreateProductDto dto);

    /// <summary>
    /// Met à jour un produit.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    /// <exception cref="ValidationException">Si les données sont invalides</exception>
    Task UpdateAsync(Guid id, UpdateProductDto dto);

    /// <summary>
    /// Modifie le stock d'un produit.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    /// <exception cref="ValidationException">Si la quantité est invalide</exception>
    /// <exception cref="DomainException">Si l'opération viole une règle métier</exception>
    Task ChangeStockAsync(Guid id, int quantity);

    /// <summary>
    /// Supprime un produit.
    /// </summary>
    /// <exception cref="NotFoundException">Si le produit n'existe pas</exception>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// Récupère les produits les plus populaires.
    /// </summary>
    Task<List<ProductListItemDto>> GetTopProductsAsync(int limit);
}

public class ProductSearchParams
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool OnlyAvailable { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "createdAt";
    public string SortDir { get; set; } = "desc";
}

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (TotalCount + PageSize - 1) / PageSize;
    public bool HasNextPage => PageNumber < TotalPages;
    public bool HasPreviousPage => PageNumber > 1;
}
