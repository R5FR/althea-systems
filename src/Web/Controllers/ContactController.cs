namespace Web.Controllers;

using Application.Services;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(IContactService contactService, ILogger<ContactController> logger)
    {
        _contactService = contactService ?? throw new ArgumentNullException(nameof(contactService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Soumet un message de contact (accès public).
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Submit([FromBody] SubmitContactDto dto)
    {
        try
        {
            await _contactService.SubmitAsync(dto);
            return NoContent();
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Contact Submit: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Récupère l'historique des conversations chatbot de l'utilisateur connecté.
    /// </summary>
    [HttpGet("chatbot/history")]
    [Authorize]
    [ProducesResponseType(typeof(List<ChatHistoryItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChatHistory()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        var history = await _contactService.GetChatHistoryAsync(userId);
        return Ok(history);
    }

    /// <summary>
    /// Répond via le chatbot IA (utilisateur connecté uniquement).
    /// </summary>
    [HttpPost("chatbot")]
    [Authorize]
    [ProducesResponseType(typeof(ChatbotResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Chatbot([FromBody] ChatbotRequestDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
            return Unauthorized();

        try
        {
            var response = await _contactService.ChatAsync(dto, userId, cancellationToken);
            return Ok(response);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Validation error in Contact Chatbot: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Chatbot call failed");
            return Ok(new ChatbotResponseDto
            {
                Message = "Je rencontre un souci temporaire. Merci d'utiliser le formulaire de contact, un conseiller vous répondra rapidement."
            });
        }
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub")
                 ?? User.FindFirst("userId");
        return claim != null && Guid.TryParse(claim.Value, out var id) ? id : Guid.Empty;
    }
}
