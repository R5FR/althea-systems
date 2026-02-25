namespace Web.Controllers;

using Application.DTOs;
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
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, IUnitOfWork unitOfWork, ILogger<AdminController> logger)
    {
        _adminService = adminService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Crée un nouveau produit (Admin seulement).
    /// </summary>
    [HttpPost("products")]
    [ProducesResponseType(typeof(dynamic), StatusCodes.Status201Created)]
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
}

public class UpdateStockRequest
{
    public int Quantity { get; set; }
}
