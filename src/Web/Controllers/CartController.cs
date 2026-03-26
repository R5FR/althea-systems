namespace Web.Controllers;

using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CartController> _logger;

    public CartController(ICartService cartService, IUnitOfWork unitOfWork, ILogger<CartController> logger)
    {
        _cartService = cartService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Récupère le panier de l'utilisateur ou de la session.
    /// </summary>
    [HttpGet("{cartId}")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCart(Guid cartId)
    {
        var cart = await _cartService.GetOrCreateCartAsync(cartId);
        return Ok(cart);
    }

    /// <summary>
    /// Ajoute un article au panier.
    /// </summary>
    [HttpPost("{cartId}/items")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AddItem(Guid cartId, [FromBody] AddCartItemRequest request)
    {
        try
        {
            await _cartService.AddItemAsync(cartId, request.ProductId, request.Quantity);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Product or cart not found for cart {CartId}", cartId);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in AddItem: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            _logger.LogWarning("Stock conflict in AddItem: {Message}", ex.Message);
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Met à jour la quantité d'un article du panier.
    /// </summary>
    [HttpPatch("items/{itemId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] UpdateCartItemRequest request)
    {
        try
        {
            await _cartService.UpdateItemAsync(itemId, request.Quantity);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Item not found: {ItemId}", itemId);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in UpdateItem: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            _logger.LogWarning("Stock conflict in UpdateItem: {Message}", ex.Message);
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Supprime un article du panier.
    /// </summary>
    [HttpDelete("items/{itemId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveItem(Guid itemId)
    {
        try
        {
            await _cartService.RemoveItemAsync(itemId);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Item not found: {ItemId}", itemId);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Vide le panier.
    /// </summary>
    [HttpDelete("{cartId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ClearCart(Guid cartId)
    {
        try
        {
            await _cartService.ClearCartAsync(cartId);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Cart not found: {CartId}", cartId);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Procède au checkout (crée une commande).
    /// </summary>
    [HttpPost("checkout")]
    [Authorize]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
    {
        try
        {
            var userId = GetUserIdFromClaims();
            if (userId == Guid.Empty)
                return Unauthorized(new { error = "User not authenticated" });

            var orderId = await _cartService.CheckoutAsync(dto, userId);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction("GetOrder", "Orders", new { id = orderId }, new { orderId });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Checkout: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            _logger.LogWarning("Conflict in Checkout: {Message}", ex.Message);
            return Conflict(new { error = ex.Message });
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

public class AddCartItemRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}

public class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}
