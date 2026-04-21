namespace Web.Controllers;

using Application.Services;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IUserService userService, ILogger<AuthController> logger)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Enregistre un nouvel utilisateur.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterUserDto dto)
    {
        try
        {
            var result = await _userService.RegisterAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Register: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            _logger.LogWarning("Conflict in Register: {Message}", ex.Message);
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Authentifie un utilisateur avec email et mot de passe.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _userService.LoginAsync(dto);
            return Ok(result);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Login: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Unauthorized in Login: {Message}", ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Rafraîchit les tokens d'accès via un refresh token valide.
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        try
        {
            var result = await _userService.RefreshTokenAsync(dto);
            return Ok(result);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Refresh: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (UnauthorizedException ex)
        {
            _logger.LogWarning("Unauthorized in Refresh: {Message}", ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Confirme l'email d'un utilisateur via token.
    /// </summary>
    [HttpPost("confirm-email")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
    {
        try
        {
            await _userService.ConfirmEmailAsync(token);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Not found in ConfirmEmail: {Message}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in ConfirmEmail: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Initie le processus de réinitialisation de mot de passe.
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        try
        {
            await _userService.ForgotPasswordAsync(dto);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Not found in ForgotPassword: {Message}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in ForgotPassword: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Réinitialise le mot de passe via un token valide.
    /// </summary>
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        try
        {
            await _userService.ResetPasswordAsync(dto);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            _logger.LogWarning("Not found in ResetPassword: {Message}", ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in ResetPassword: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Déconnecte l'utilisateur (stateless JWT - acknowledgement uniquement).
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Logout()
    {
        return NoContent();
    }
}
