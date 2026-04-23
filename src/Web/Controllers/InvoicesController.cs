namespace Web.Controllers;

using Application.DTOs;
using Application.Interfaces;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Web.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InvoicePdfGenerator _pdfGenerator;
    private readonly ILogger<InvoicesController> _logger;

    public InvoicesController(
        IInvoiceService invoiceService,
        IUnitOfWork unitOfWork,
        InvoicePdfGenerator pdfGenerator,
        ILogger<InvoicesController> logger)
    {
        _invoiceService = invoiceService;
        _unitOfWork = unitOfWork;
        _pdfGenerator = pdfGenerator;
        _logger = logger;
    }

    /// <summary>Liste les factures de l'utilisateur connecté.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<InvoiceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyInvoices()
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        var invoices = await _invoiceService.GetUserInvoicesAsync(userId);
        return Ok(invoices);
    }

    /// <summary>Retourne une facture par ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInvoice(Guid id)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var invoice = await _invoiceService.GetInvoiceAsync(id, userId);
            return Ok(invoice);
        }
        catch (NotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (UnauthorizedException) { return Forbid(); }
    }

    /// <summary>Retourne la facture d'une commande spécifique.</summary>
    [HttpGet("order/{orderId:guid}")]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInvoiceByOrder(Guid orderId)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var invoice = await _invoiceService.GetInvoiceByOrderIdAsync(orderId, userId);
            if (invoice == null) return NotFound(new { error = "No invoice for this order yet" });
            return Ok(invoice);
        }
        catch (UnauthorizedException) { return Forbid(); }
    }

    /// <summary>Télécharge le PDF de la facture.</summary>
    [HttpGet("{id:guid}/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DownloadPdf(Guid id)
    {
        try
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var dto = await _invoiceService.GetInvoiceAsync(id, userId);

            var invoice = await _unitOfWork.InvoiceRepository.GetByIdWithDetailsAsync(id)
                ?? throw new NotFoundException($"Invoice '{id}' not found");

            if (invoice.Order == null)
                return BadRequest(new { error = "Invoice has no associated order" });

            var bytes = _pdfGenerator.Generate(invoice, invoice.Order);
            return File(bytes, "application/pdf", $"facture-{dto.InvoiceNumber}.pdf");
        }
        catch (NotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (UnauthorizedException) { return Forbid(); }
    }

    // ─── Admin endpoints ──────────────────────────────────────────────────────

    /// <summary>Admin: liste toutes les factures.</summary>
    [HttpGet("admin/all")]
    [Authorize(Policy = "RequireAdminRole")]
    [ProducesResponseType(typeof(List<InvoiceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllInvoices()
    {
        var invoices = await _invoiceService.GetAllInvoicesAsync();
        return Ok(invoices);
    }

    /// <summary>Admin: génère une facture pour une commande.</summary>
    [HttpPost("admin/order/{orderId:guid}/generate")]
    [Authorize(Policy = "RequireAdminRole")]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> GenerateInvoice(Guid orderId)
    {
        try
        {
            var invoice = await _invoiceService.GenerateInvoiceAsync(orderId);
            return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
        }
        catch (NotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
    }

    /// <summary>Admin: met à jour le statut d'une facture.</summary>
    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "RequireAdminRole")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateInvoiceStatusRequest request)
    {
        try
        {
            await _invoiceService.UpdateInvoiceStatusAsync(id, request.Status);
            return NoContent();
        }
        catch (NotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (ValidationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    /// <summary>Admin: télécharge le PDF d'une facture sans contrôle propriétaire.</summary>
    [HttpGet("admin/{id:guid}/pdf")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> AdminDownloadPdf(Guid id)
    {
        try
        {
            var invoice = await _unitOfWork.InvoiceRepository.GetByIdWithDetailsAsync(id)
                ?? throw new NotFoundException($"Invoice '{id}' not found");

            if (invoice.Order == null)
                return BadRequest(new { error = "Invoice has no associated order" });

            var bytes = _pdfGenerator.Generate(invoice, invoice.Order);
            return File(bytes, "application/pdf", $"facture-{invoice.InvoiceNumber}.pdf");
        }
        catch (NotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub")
                 ?? User.FindFirst("userId");
        return claim != null && Guid.TryParse(claim.Value, out var id) ? id : Guid.Empty;
    }
}

public class UpdateInvoiceStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
