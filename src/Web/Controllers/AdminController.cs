namespace Web.Controllers;

using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ICategoryService _categoryService;
    private readonly IContactService _contactService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBlobStorageService _blobStorage;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, ICategoryService categoryService, IContactService contactService, IUnitOfWork unitOfWork, IBlobStorageService blobStorage, ILogger<AdminController> logger)
    {
        _adminService = adminService;
        _categoryService = categoryService;
        _contactService = contactService;
        _unitOfWork = unitOfWork;
        _blobStorage = blobStorage;
        _logger = logger;
    }

    /// <summary>
    /// Crée un nouveau produit (Admin seulement).
    /// </summary>
    [HttpPost("products")]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
    {
        try
        {
            var productId = await _adminService.CreateProductAsync(dto);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction("GetById", "Products", new { id = productId }, new { id = productId });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in CreateProduct: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            _logger.LogWarning("Conflict in CreateProduct: {Message}", ex.Message);
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Met à jour le stock d'un produit.
    /// </summary>
    [HttpPatch("products/{productId}/stock")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStock(Guid productId, [FromBody] UpdateStockRequest request)
    {
        try
        {
            await _adminService.UpdateStockAsync(productId, request.Quantity);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Product not found: {ProductId}", productId);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in UpdateStock: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Exporte la liste des produits en CSV.
    /// </summary>
    [HttpGet("products/export/csv")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportProductsCsv()
    {
        try
        {
            var fileBytes = await _adminService.ExportProductsCsvAsync();
            var fileName = $"products_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
            return File(fileBytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting products CSV");
            return StatusCode(500, new { error = "An error occurred while exporting products" });
        }
    }

    /// <summary>
    /// Exporte la liste des commandes en CSV.
    /// </summary>
    [HttpGet("orders/export/csv")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportOrdersCsv([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var fileBytes = await _adminService.ExportOrdersCsvAsync(startDate, endDate);
            var fileName = $"orders_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
            return File(fileBytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting orders CSV");
            return StatusCode(500, new { error = "An error occurred while exporting orders" });
        }
    }

    /// <summary>
    /// Exporte la liste des utilisateurs en CSV.
    /// </summary>
    [HttpGet("users/export/csv")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportUsersCsv()
    {
        try
        {
            var fileBytes = await _adminService.ExportUsersCsvAsync();
            var fileName = $"users_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
            return File(fileBytes, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting users CSV");
            return StatusCode(500, new { error = "An error occurred while exporting users" });
        }
    }

    /// <summary>
    /// Envoie une alerte de restockage pour les produits en rupture.
    /// </summary>
    [HttpPost("restock-alert")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RestockAlert()
    {
        try
        {
            await _adminService.RestockAlertAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending restock alert");
            return StatusCode(500, new { error = "An error occurred while sending restock alert" });
        }
    }

    // ─── Dashboard ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Retourne les statistiques du tableau de bord.
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard()
    {
        var stats = await _adminService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    // ─── Users ───────────────────────────────────────────────────────────────────

    /// <summary>
    /// Retourne la liste paginée des utilisateurs.
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var users = await _adminService.GetUsersAsync(search, page, pageSize);
        var total = await _adminService.GetUsersTotalCountAsync(search);
        return Ok(new { data = users, total, page, pageSize });
    }

    /// <summary>
    /// Désactive un compte utilisateur.
    /// </summary>
    [HttpPatch("users/{id}/disable")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DisableUser(Guid id)
    {
        try
        {
            await _adminService.DisableUserAsync(id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Active un compte utilisateur.
    /// </summary>
    [HttpPatch("users/{id}/enable")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EnableUser(Guid id)
    {
        try
        {
            await _adminService.EnableUserAsync(id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // ─── Orders ──────────────────────────────────────────────────────────────────

    /// <summary>
    /// Retourne la liste paginée des commandes.
    /// </summary>
    [HttpGet("orders")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOrders([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 25)
    {
        var orders = await _adminService.GetOrdersAsync(search, status, page, pageSize);
        var total = await _adminService.GetOrdersTotalCountAsync(search, status);
        return Ok(new { data = orders, total, page, pageSize });
    }

    /// <summary>
    /// Met à jour le statut d'une commande.
    /// </summary>
    [HttpPatch("orders/{id}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        try
        {
            await _adminService.UpdateOrderStatusAsync(id, request.Status);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // ─── Categories ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Retourne toutes les catégories (admin, incluant inactives).
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(List<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _adminService.GetCategoriesAdminAsync();
        return Ok(categories);
    }

    /// <summary>
    /// Crée une nouvelle catégorie.
    /// </summary>
    [HttpPost("categories")]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        try
        {
            var id = await _categoryService.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created, new { id });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Met à jour une catégorie.
    /// </summary>
    [HttpPut("categories/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CreateCategoryDto dto)
    {
        try
        {
            await _categoryService.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Supprime une catégorie.
    /// </summary>
    [HttpDelete("categories/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        try
        {
            await _categoryService.DeleteAsync(id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Active ou désactive une catégorie.
    /// </summary>
    [HttpPatch("categories/{id}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetCategoryStatus(Guid id, [FromBody] SetCategoryStatusRequest request)
    {
        try
        {
            await _categoryService.SetStatusAsync(id, request.Active);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // ─── Messages ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Retourne tous les messages de contact.
    /// </summary>
    [HttpGet("messages")]
    [ProducesResponseType(typeof(List<ContactMessageDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMessages([FromQuery] bool unreadOnly = false)
    {
        var messages = await _contactService.GetAllAsync(unreadOnly);
        return Ok(messages);
    }

    /// <summary>
    /// Marque un message comme lu.
    /// </summary>
    [HttpPatch("messages/{id}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkMessageRead(Guid id)
    {
        try
        {
            await _contactService.MarkAsReadAsync(id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Upload une image pour un produit.
    /// </summary>
    [HttpPost("products/{productId}/images")]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadProductImage(Guid productId, IFormFile file, [FromQuery] bool isMain = false, [FromQuery] int displayOrder = 0)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided" });

        var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowed.Contains(file.ContentType))
            return BadRequest(new { error = "Only JPEG, PNG, WEBP or GIF images are allowed" });

        try
        {
            var product = await _unitOfWork.ProductRepository.GetByIdAsync(productId);
            if (product == null)
                return NotFound(new { error = $"Product '{productId}' not found" });

            await using var stream = file.OpenReadStream();
            var url = await _blobStorage.UploadAsync(stream, file.FileName, file.ContentType);

            var image = new Project.Domain.Entities.ProductImage(Guid.NewGuid(), product, url, isMain, displayOrder);
            await _unitOfWork.ProductImageRepository.AddAsync(image);
            await _unitOfWork.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, new { id = image.Id, url });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image for product {ProductId}", productId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Upload failed" });
        }
    }

    /// <summary>
    /// Supprime une image produit.
    /// </summary>
    [HttpDelete("products/{productId}/images/{imageId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProductImage(Guid productId, Guid imageId)
    {
        try
        {
            var image = await _unitOfWork.ProductImageRepository.GetByIdAsync(imageId);
            if (image == null)
                return NotFound(new { error = $"Image '{imageId}' not found" });

            await _blobStorage.DeleteAsync(image.ImageUrl);
            await _unitOfWork.ProductImageRepository.DeleteAsync(imageId);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Project.Domain.Exceptions.NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image {ImageId}", imageId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Delete failed" });
        }
    }

    /// <summary>
    /// Liste les images d'un produit.
    /// </summary>
    [HttpGet("products/{productId}/images")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProductImages(Guid productId)
    {
        var images = await _unitOfWork.ProductImageRepository.GetByProductIdAsync(productId);
        return Ok(images.Select(i => new { i.Id, i.ImageUrl, i.IsMain, i.DisplayOrder }));
    }
}

public class UpdateStockRequest
{
    public int Quantity { get; set; }
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class SetCategoryStatusRequest
{
    public bool Active { get; set; }
}
