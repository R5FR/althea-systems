namespace Web.Controllers;

using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, IUnitOfWork unitOfWork, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Recherche les produits avec filtres et pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Search([FromQuery] string? searchTerm, [FromQuery] Guid? categoryId, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var searchParams = new ProductSearchParams
            {
                SearchTerm = searchTerm,
                CategoryId = categoryId,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            var result = await _productService.SearchAsync(searchParams);

            return Ok(new
            {
                data = result.Items,
                pagination = new
                {
                    totalCount = result.TotalCount,
                    pageNumber = result.PageNumber,
                    pageSize = result.PageSize,
                    totalPages = result.TotalPages,
                    hasNextPage = result.HasNextPage,
                    hasPreviousPage = result.HasPreviousPage
                }
            });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Search: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Récupère un produit par son ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var product = await _productService.GetByIdAsync(id);
            return Ok(product);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Product not found: {Id}", id);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Récupère un produit par son slug.
    /// </summary>
    [HttpGet("slug/{slug}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        try
        {
            var product = await _productService.GetBySlugAsync(slug);
            return Ok(product);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Product not found by slug: {Slug}", slug);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Crée un nouveau produit (Admin seulement).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        try
        {
            var productId = await _productService.CreateAsync(dto);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = productId }, new { id = productId });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Create: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            _logger.LogWarning("Conflict in Create: {Message}", ex.Message);
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Met à jour un produit (Admin seulement).
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto)
    {
        try
        {
            await _productService.UpdateAsync(id, dto);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Product not found: {Id}", id);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Update: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Supprime un produit (Admin seulement).
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _productService.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Product not found: {Id}", id);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Récupère les produits les plus populaires.
    /// </summary>
    [HttpGet("top/{limit}")]
    [ProducesResponseType(typeof(List<ProductListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTop(int limit = 10)
    {
        if (limit < 1 || limit > 100)
            limit = 10;

        var products = await _productService.GetTopProductsAsync(limit);
        return Ok(products);
    }
}
