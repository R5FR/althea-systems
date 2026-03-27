namespace Web.Controllers;

using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, IUnitOfWork unitOfWork, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Récupère une commande par ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == Guid.Empty)
                return Unauthorized(new { error = "User not authenticated" });

            var order = await _orderService.GetOrderAsync(id, userId);
            return Ok(order);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Order not found: {OrderId}", id);
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Access denied for order: {OrderId}", id);
            return Forbid();
        }
    }

    /// <summary>
    /// Liste les commandes de l'utilisateur.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ListOrders([FromQuery] string? status, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == Guid.Empty)
                return Unauthorized(new { error = "User not authenticated" });

            var filterParams = new OrderFilterParams
            {
                Status = status,
                StartDate = startDate,
                EndDate = endDate,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            var result = await _orderService.ListOrdersAsync(userId, filterParams);

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing orders");
            return StatusCode(500, new { error = "An error occurred while retrieving orders" });
        }
    }

    /// <summary>
    /// Annule une commande.
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == Guid.Empty)
                return Unauthorized(new { error = "User not authenticated" });

            await _orderService.CancelOrderAsync(id, userId);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Order not found: {OrderId}", id);
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Access denied for order: {OrderId}", id);
            return Forbid();
        }
        catch (ConflictException ex)
        {
            _logger.LogWarning("Conflict cancelling order: {Message}", ex.Message);
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Exporte une commande au format spécifié.
    /// </summary>
    [HttpGet("{id}/export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ExportOrder(Guid id, [FromQuery] string format = "pdf")
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == Guid.Empty)
                return Unauthorized(new { error = "User not authenticated" });

            var fileBytes = await _orderService.ExportOrderAsync(id, userId, format);

            var mimeType = format.ToLower() switch
            {
                "pdf" => "application/pdf",
                "csv" => "text/csv",
                "json" => "application/json",
                _ => "application/octet-stream"
            };

            var fileName = $"order_{id}.{format}";
            return File(fileBytes, mimeType, fileName);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Order not found: {OrderId}", id);
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Access denied for order: {OrderId}", id);
            return Forbid();
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in ExportOrder: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    private Guid GetUserIdFromClaims()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub")
                       ?? User.FindFirst("userId");
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            return userId;

        return Guid.Empty;
    }
}
