namespace Application.Services;

using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Project.Domain.Entities;
using Project.Domain.Exceptions;

/// <summary>
/// Implémentation concrète du service de gestion des produits.
/// </summary>
public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<ProductDto> GetByIdAsync(Guid id)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));

        var product = await _unitOfWork.ProductRepository.GetByIdAsync(id);
        if (product == null)
        {
            throw new NotFoundException($"Product with id '{id}' not found");
        }

        return _mapper.Map<ProductDto>(product);
    }

    public async Task<PaginatedResult<ProductListItemDto>> SearchAsync(ProductSearchParams searchParams)
    {
        if (searchParams == null) throw new ArgumentNullException(nameof(searchParams));
        if (searchParams.PageNumber < 1) throw new ValidationException("PageNumber must be >= 1");
        if (searchParams.PageSize < 1) throw new ValidationException("PageSize must be >= 1");

        // Calculer skip et take
        var skip = (searchParams.PageNumber - 1) * searchParams.PageSize;
        var take = searchParams.PageSize;

        // Récupérer les produits
        var products = await _unitOfWork.ProductRepository.SearchAsync(
            searchParams.SearchTerm,
            searchParams.CategoryId,
            searchParams.MinPrice,
            searchParams.MaxPrice,
            skip,
            take);

        // Compter le total
        var totalCount = await _unitOfWork.ProductRepository.CountAsync(
            searchParams.SearchTerm,
            searchParams.CategoryId,
            searchParams.MinPrice,
            searchParams.MaxPrice);

        // Mapper les produits
        var items = _mapper.Map<List<ProductListItemDto>>(products);

        return new PaginatedResult<ProductListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = searchParams.PageNumber,
            PageSize = searchParams.PageSize
        };
    }

    public async Task<Guid> CreateAsync(CreateProductDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new ValidationException("Name is required");
        if (dto.PriceHt < 0) throw new ValidationException("PriceHt cannot be negative");
        if (dto.TvaRate < 0) throw new ValidationException("TvaRate cannot be negative");
        if (dto.StockQuantity < 0) throw new ValidationException("StockQuantity cannot be negative");
        if (dto.CategoryId == Guid.Empty) throw new ValidationException("CategoryId is required");

        // Générer un slug si non fourni
        var slug = !string.IsNullOrWhiteSpace(dto.Slug)
            ? dto.Slug
            : GenerateSlug(dto.Name);

        // Vérifier que le slug n'existe pas déjà
        var existingProduct = await _unitOfWork.ProductRepository.GetBySlugAsync(slug);
        if (existingProduct != null)
        {
            throw new ConflictException($"Product with slug '{slug}' already exists");
        }

        // Créer la nouvelle entité Product
        // Note: La catégorie doit être récupérée ou créée
        // Pour l'instant, on utilise un placeholder
        var product = new Product(
            Guid.NewGuid(),
            dto.Name,
            dto.Description ?? string.Empty,
            dto.PriceHt,
            dto.TvaRate,
            dto.StockQuantity,
            null!, // Category sera définie via EF selon la configuration
            slug);

        await _unitOfWork.ProductRepository.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return product.Id;
    }

    public async Task UpdateAsync(Guid id, UpdateProductDto dto)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));
        if (dto == null) throw new ArgumentNullException(nameof(dto));

        var product = await _unitOfWork.ProductRepository.GetByIdAsync(id);
        if (product == null)
        {
            throw new NotFoundException($"Product with id '{id}' not found");
        }

        // Valider les données
        if (!string.IsNullOrWhiteSpace(dto.Name) && string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ValidationException("Name cannot be empty");
        }

        // À adapter selon l'implémentation réelle de l'entité Product
        // Pour l'instant, les propriétés Product étant en private set, on doit ajouter des setters ou des méthodes

        await _unitOfWork.ProductRepository.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ChangeStockAsync(Guid id, int quantity)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));

        var product = await _unitOfWork.ProductRepository.GetByIdAsync(id);
        if (product == null)
        {
            throw new NotFoundException($"Product with id '{id}' not found");
        }

        if (quantity > 0)
        {
            product.IncreaseStock(quantity);
        }
        else if (quantity < 0)
        {
            product.DecreaseStock(Math.Abs(quantity));
        }

        await _unitOfWork.ProductRepository.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        if (id == Guid.Empty) throw new ArgumentException("Id cannot be empty", nameof(id));

        var product = await _unitOfWork.ProductRepository.GetByIdAsync(id);
        if (product == null)
        {
            throw new NotFoundException($"Product with id '{id}' not found");
        }

        await _unitOfWork.ProductRepository.DeleteAsync(id);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<ProductListItemDto>> GetTopProductsAsync(int limit)
    {
        if (limit < 1) throw new ArgumentException("Limit must be > 0", nameof(limit));

        var products = await _unitOfWork.ProductRepository.GetTopProductsAsync(limit);
        return _mapper.Map<List<ProductListItemDto>>(products);
    }

    /// <summary>
    /// Génère un slug à partir du nom du produit.
    /// </summary>
    private static string GenerateSlug(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return string.Empty;

        // Convertir en minuscules
        var slug = name.ToLowerInvariant();

        // Remplacer les espaces et caractères spéciaux par des tirets
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^\w\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[\s_-]+", "-");
        slug = slug.Trim('-');

        return slug;
    }
}
