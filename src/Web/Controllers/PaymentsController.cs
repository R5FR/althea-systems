namespace Web.Controllers;

using Application.DTOs;
using Application.Interfaces;
using Project.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentsController> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IInvoiceService _invoiceService;

    public PaymentsController(
        IConfiguration configuration,
        ILogger<PaymentsController> logger,
        IUnitOfWork unitOfWork,
        IInvoiceService invoiceService)
    {
        _configuration = configuration;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _invoiceService = invoiceService;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    /// <summary>
    /// Crée un PaymentIntent Stripe et retourne le client_secret.
    /// </summary>
    [HttpPost("intent")]
    [Authorize]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
    {
        if (request.Amount <= 0)
            return BadRequest(new { error = "Amount must be positive" });

        try
        {
            string? stripeCustomerId = null;
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
            {
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
                if (user != null)
                {
                    if (!string.IsNullOrWhiteSpace(user.StripeCustomerId))
                    {
                        stripeCustomerId = user.StripeCustomerId;
                    }
                    else if (user.PaymentMethods.Any(p => !string.IsNullOrEmpty(p.Token)))
                    {
                        var customer = await new CustomerService().CreateAsync(new CustomerCreateOptions
                        {
                            Email = user.Email.Value,
                            Name = $"{user.FirstName} {user.LastName}",
                            Metadata = new Dictionary<string, string> { ["userId"] = userId.ToString() }
                        });
                        stripeCustomerId = customer.Id;
                        user.SetStripeCustomerId(stripeCustomerId);

                        var pmSvc = new PaymentMethodService();
                        foreach (var pm in user.PaymentMethods.Where(p => !string.IsNullOrEmpty(p.Token)))
                        {
                            try
                            {
                                await pmSvc.AttachAsync(pm.Token, new PaymentMethodAttachOptions { Customer = stripeCustomerId });
                            }
                            catch (StripeException ex) when (ex.StripeError?.Code == "payment_method_already_attached") { }
                        }

                        await _unitOfWork.UserRepository.UpdateAsync(user);
                        await _unitOfWork.SaveChangesAsync();
                    }
                }
            }

            var options = new PaymentIntentCreateOptions
            {
                Amount = request.Amount,
                Currency = request.Currency ?? "eur",
                Customer = stripeCustomerId,
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            return Ok(new { clientSecret = intent.ClientSecret, paymentIntentId = intent.Id });
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error creating PaymentIntent");
            return BadRequest(new { error = ex.StripeError?.Message ?? ex.Message });
        }
    }

    /// <summary>
    /// Crée un SetupIntent pour sauvegarder une carte sans paiement immédiat.
    /// </summary>
    [HttpPost("setup-intent")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSetupIntent()
    {
        try
        {
            var options = new SetupIntentCreateOptions { PaymentMethodTypes = new List<string> { "card" } };
            var service = new SetupIntentService();
            var intent = await service.CreateAsync(options);
            return Ok(new { clientSecret = intent.ClientSecret });
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe error creating SetupIntent");
            return BadRequest(new { error = ex.StripeError?.Message ?? ex.Message });
        }
    }

    /// <summary>
    /// Confirme un paiement Stripe, marque la commande Paid et génère la facture.
    /// </summary>
    [HttpPost("{orderId:guid}/confirm")]
    [Authorize]
    [ProducesResponseType(typeof(InvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmPayment(Guid orderId, [FromBody] ConfirmPaymentRequest request)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { error = "User not authenticated" });

            var order = await _unitOfWork.OrderRepository.GetByIdAsync(orderId);
            if (order == null)
                return NotFound(new { error = $"Order '{orderId}' not found" });

            if (order.User?.Id != userId)
                return Forbid();

            if (!string.IsNullOrWhiteSpace(request.PaymentIntentId))
            {
                try
                {
                    var piService = new PaymentIntentService();
                    var pi = await piService.GetAsync(request.PaymentIntentId);
                    if (pi.Status != "succeeded")
                        return BadRequest(new { error = $"Payment not succeeded (status: {pi.Status})" });
                }
                catch (StripeException ex)
                {
                    _logger.LogWarning(ex, "Stripe verification failed for PaymentIntent {Id}", request.PaymentIntentId);
                    return BadRequest(new { error = "Unable to verify payment with Stripe" });
                }
            }

            if (order.Status != Project.Domain.Enums.OrderStatus.Paid)
            {
                order.MarkAsPaid();
                await _unitOfWork.OrderRepository.UpdateAsync(order);
                await _unitOfWork.SaveChangesAsync();
            }

            var invoice = await _invoiceService.GenerateInvoiceAsync(orderId);
            return Ok(invoice);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment for order {OrderId}", orderId);
            return StatusCode(500, new { error = "An error occurred while confirming payment" });
        }
    }
}

public class CreatePaymentIntentRequest
{
    public long Amount { get; set; }
    public string? Currency { get; set; }
}

public class ConfirmPaymentRequest
{
    public string? PaymentIntentId { get; set; }
}
