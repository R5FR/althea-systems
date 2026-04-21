namespace Web.Controllers;

using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Stripe;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UsersController> _logger;
    private readonly IConfiguration _configuration;

    public UsersController(IUserService userService, IUnitOfWork unitOfWork, ILogger<UsersController> logger, IConfiguration configuration)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    /// <summary>
    /// Récupère le profil de l'utilisateur connecté.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            var profile = await _userService.GetProfileAsync(userId);
            return Ok(profile);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Met à jour le profil de l'utilisateur connecté.
    /// </summary>
    [HttpPut("me")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserDto dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            await _userService.UpdateProfileAsync(userId, dto);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in UpdateProfile: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    // ─── Addresses ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Récupère toutes les adresses de l'utilisateur connecté.
    /// </summary>
    [HttpGet("me/addresses")]
    [ProducesResponseType(typeof(List<AddressDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAddresses()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            var addresses = await _userService.GetAddressesAsync(userId);
            return Ok(addresses);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Ajoute une adresse pour l'utilisateur connecté.
    /// </summary>
    [HttpPost("me/addresses")]
    [ProducesResponseType(typeof(AddressDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddAddress([FromBody] CreateAddressDto dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            var address = await _userService.AddAddressAsync(userId, dto);
            return StatusCode(StatusCodes.Status201Created, address);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in AddAddress: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Met à jour une adresse de l'utilisateur connecté.
    /// </summary>
    [HttpPut("me/addresses/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] CreateAddressDto dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            await _userService.UpdateAddressAsync(userId, id, dto);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Not found in UpdateAddress: {Message}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in UpdateAddress: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Supprime une adresse de l'utilisateur connecté.
    /// </summary>
    [HttpDelete("me/addresses/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAddress(Guid id)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            await _userService.DeleteAddressAsync(userId, id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Not found in DeleteAddress: {Message}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
    }

    // ─── Payment Methods ─────────────────────────────────────────────────────────

    /// <summary>
    /// Récupère tous les moyens de paiement de l'utilisateur connecté.
    /// </summary>
    [HttpGet("me/payment-methods")]
    [ProducesResponseType(typeof(List<PaymentMethodDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPaymentMethods()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            var paymentMethods = await _userService.GetPaymentMethodsAsync(userId);
            return Ok(paymentMethods);
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Ajoute un moyen de paiement pour l'utilisateur connecté.
    /// </summary>
    [HttpPost("me/payment-methods")]
    [ProducesResponseType(typeof(PaymentMethodDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddPaymentMethod([FromBody] AddPaymentMethodDto dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            // Frontend sends only StripePaymentMethodId — fetch card details from Stripe
            if (!string.IsNullOrWhiteSpace(dto.StripePaymentMethodId) && string.IsNullOrWhiteSpace(dto.Last4))
            {
                StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
                var pmService = new PaymentMethodService();
                var pm = await pmService.GetAsync(dto.StripePaymentMethodId);
                if (pm?.Card == null)
                    return BadRequest(new { error = "Invalid Stripe payment method" });

                dto.Provider = "stripe";
                dto.CardBrand = pm.Card.Brand ?? string.Empty;
                dto.Last4 = pm.Card.Last4 ?? string.Empty;
                dto.ExpMonth = (int)pm.Card.ExpMonth;
                dto.ExpYear = (int)pm.Card.ExpYear;
                dto.Token = dto.StripePaymentMethodId;

                // Ensure the user has a Stripe Customer and the PM is attached to it
                var userEntity = await _unitOfWork.UserRepository.GetByIdAsync(userId);
                if (userEntity != null)
                {
                    string stripeCustomerId;
                    if (!string.IsNullOrWhiteSpace(userEntity.StripeCustomerId))
                    {
                        stripeCustomerId = userEntity.StripeCustomerId;
                    }
                    else
                    {
                        var customer = await new CustomerService().CreateAsync(new CustomerCreateOptions
                        {
                            Email = userEntity.Email.Value,
                            Name = $"{userEntity.FirstName} {userEntity.LastName}",
                            Metadata = new Dictionary<string, string> { ["userId"] = userId.ToString() }
                        });
                        stripeCustomerId = customer.Id;
                        userEntity.SetStripeCustomerId(stripeCustomerId);
                        await _unitOfWork.UserRepository.UpdateAsync(userEntity);
                        await _unitOfWork.SaveChangesAsync();
                    }

                    await pmService.AttachAsync(dto.StripePaymentMethodId, new PaymentMethodAttachOptions
                    {
                        Customer = stripeCustomerId
                    });
                }
            }

            var paymentMethod = await _userService.AddPaymentMethodAsync(userId, dto);
            return StatusCode(StatusCodes.Status201Created, paymentMethod);
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error retrieving payment method");
            return BadRequest(new { error = ex.StripeError?.Message ?? ex.Message });
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("User not found: {UserId}", userId);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in AddPaymentMethod: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Définit un moyen de paiement comme défaut pour l'utilisateur connecté.
    /// </summary>
    [HttpPatch("me/payment-methods/{id}/default")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetDefaultPaymentMethod(Guid id)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            await _userService.SetDefaultPaymentMethodAsync(userId, id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Not found in SetDefaultPaymentMethod: {Message}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Supprime un moyen de paiement de l'utilisateur connecté.
    /// </summary>
    [HttpDelete("me/payment-methods/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePaymentMethod(Guid id)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            await _userService.DeletePaymentMethodAsync(userId, id);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Not found in DeletePaymentMethod: {Message}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
    }
}
