namespace Web.Controllers;

using Application.Interfaces;
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

    public PaymentsController(IConfiguration configuration, ILogger<PaymentsController> logger, IUnitOfWork unitOfWork)
    {
        _configuration = configuration;
        _logger = logger;
        _unitOfWork = unitOfWork;
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
            // Ensure the user has a Stripe Customer (required to reuse saved PMs)
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
                        // User has saved cards but no Stripe Customer yet — create one and
                        // retroactively attach all saved PMs (handles cards saved before this fix)
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
                            catch (StripeException ex) when (ex.StripeError?.Code == "payment_method_already_attached")
                            {
                                // Already attached to this customer — skip
                            }
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
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                },
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            return Ok(new
            {
                clientSecret = intent.ClientSecret,
                paymentIntentId = intent.Id
            });
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
            var options = new SetupIntentCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
            };

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
}

public class CreatePaymentIntentRequest
{
    public long Amount { get; set; }
    public string? Currency { get; set; }
}
