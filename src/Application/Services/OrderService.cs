namespace Application.Services;

using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Project.Domain.Entities;
using Project.Domain.Exceptions;

/// <summary>
/// Implémentation concrète du service de gestion des commandes.
/// </summary>
public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public OrderService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<Guid> PlaceOrderAsync(CheckoutDto dto, Guid userId)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (dto.CartId == Guid.Empty) throw new ValidationException("CartId is required");

        var cart = await _unitOfWork.CartRepository.GetByIdAsync(dto.CartId);
        if (cart == null)
        {
            throw new NotFoundException($"Cart with id '{dto.CartId}' not found");
        }

        if (!cart.Items.Any())
        {
            throw new ValidationException("Cart is empty");
        }

        // Récupérer l'utilisateur
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        // Vérifier que l'AddressId figure parmi les adresses de l'utilisateur si fourni
        Address? billingAddress = null;
        Address? shippingAddress = null;

        if (dto.AddressId.HasValue && dto.AddressId.Value != Guid.Empty)
        {
            var address = user.Addresses.FirstOrDefault(a => a.Id == dto.AddressId.Value);
            if (address == null)
            {
                throw new ValidationException("Address not found for this user");
            }

            billingAddress = address;
            shippingAddress = address;
        }
        else
        {
            throw new ValidationException("Address is required for checkout");
        }

        // Récupérer le PaymentMethod si fourni
        PaymentMethod? paymentMethod = null;
        if (dto.PaymentMethodId.HasValue && dto.PaymentMethodId.Value != Guid.Empty)
        {
            paymentMethod = user.PaymentMethods.FirstOrDefault(pm => pm.Id == dto.PaymentMethodId.Value);
            if (paymentMethod == null)
            {
                throw new ValidationException("PaymentMethod not found for this user");
            }
        }
        else
        {
            throw new ValidationException("PaymentMethod is required for checkout");
        }

        // Créer une commande depuis le panier
        var orderNumber = GenerateOrderNumber();
        var order = new Order(
            Guid.NewGuid(),
            user.Id,
            orderNumber,
            user,
            billingAddress,
            shippingAddress,
            paymentMethod);

        // Ajouter les items du panier à la commande
        foreach (var cartItem in cart.Items)
        {
            var product = cartItem.Product;

            var orderItem = new OrderItem(
                Guid.NewGuid(),
                order.Id,
                product.Id,
                product,
                product.Name,
                product.PriceHt,
                product.TvaRate,
                cartItem.Quantity);

            order.AddItem(orderItem);

            // Décréémenter le stock
            product.DecreaseStock(cartItem.Quantity);
            await _unitOfWork.ProductRepository.UpdateAsync(product);
        }

        // Sauvegarder la commande
        await _unitOfWork.OrderRepository.AddAsync(order);
        await _unitOfWork.SaveChangesAsync();

        // Vider le panier
        await _unitOfWork.CartRepository.DeleteAsync(cart.Id);
        await _unitOfWork.SaveChangesAsync();

        return order.Id;
    }

    public async Task<OrderDto> GetOrderAsync(Guid orderId, Guid callerUserId)
    {
        if (orderId == Guid.Empty) throw new ArgumentException("OrderId cannot be empty", nameof(orderId));
        if (callerUserId == Guid.Empty) throw new ArgumentException("CallerUserId cannot be empty", nameof(callerUserId));

        var order = await _unitOfWork.OrderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new NotFoundException($"Order with id '{orderId}' not found");
        }

        // Vérifier que l'utilisateur a accès à cette commande (owner ou admin)
        // Pour l'instant, on vérifie juste que c'est le propriétaire
        if (order.User.Id != callerUserId)
        {
            // À adapter selon les rôles
            throw new UnauthorizedException("You do not have permission to access this order");
        }

        return _mapper.Map<OrderDto>(order);
    }

    public async Task<PaginatedResult<OrderDto>> ListOrdersAsync(Guid userId, OrderFilterParams filterParams)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (filterParams == null) throw new ArgumentNullException(nameof(filterParams));
        if (filterParams.PageNumber < 1) throw new ValidationException("PageNumber must be >= 1");
        if (filterParams.PageSize < 1) throw new ValidationException("PageSize must be >= 1");

        // Calculer skip et take
        var skip = (filterParams.PageNumber - 1) * filterParams.PageSize;
        var take = filterParams.PageSize;

        // Récupérer les commandes de l'utilisateur
        var orders = await _unitOfWork.OrderRepository.GetByUserIdAsync(userId, skip, take);
        var totalCount = await _unitOfWork.OrderRepository.CountByUserIdAsync(userId);

        // Mapper les commandes
        var items = _mapper.Map<List<OrderDto>>(orders);

        return new PaginatedResult<OrderDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = filterParams.PageNumber,
            PageSize = filterParams.PageSize
        };
    }

    public async Task CancelOrderAsync(Guid orderId, Guid callerUserId)
    {
        if (orderId == Guid.Empty) throw new ArgumentException("OrderId cannot be empty", nameof(orderId));
        if (callerUserId == Guid.Empty) throw new ArgumentException("CallerUserId cannot be empty", nameof(callerUserId));

        var order = await _unitOfWork.OrderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new NotFoundException($"Order with id '{orderId}' not found");
        }

        // Vérifier les permissions
        if (order.User.Id != callerUserId)
        {
            throw new UnauthorizedException("You do not have permission to cancel this order");
        }

        // Vérifier que la commande peut être annulée
        if (order.Status != Project.Domain.Enums.OrderStatus.Pending)
        {
            throw new ConflictException("Only pending orders can be cancelled");
        }

        // Annuler la commande
        // À adapter selon l'implémentation réelle de l'entité Order
        // Pour l'instant, on suppose une méthode Cancel ou une mise à jour du statut

        await _unitOfWork.OrderRepository.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<byte[]> ExportOrderAsync(Guid orderId, Guid callerUserId, string format)
    {
        if (orderId == Guid.Empty) throw new ArgumentException("OrderId cannot be empty", nameof(orderId));
        if (callerUserId == Guid.Empty) throw new ArgumentException("CallerUserId cannot be empty", nameof(callerUserId));
        if (string.IsNullOrWhiteSpace(format)) throw new ArgumentException("Format is required", nameof(format));

        var order = await _unitOfWork.OrderRepository.GetByIdAsync(orderId);
        if (order == null)
        {
            throw new NotFoundException($"Order with id '{orderId}' not found");
        }

        // Vérifier les permissions
        if (order.User.Id != callerUserId)
        {
            throw new UnauthorizedException("You do not have permission to export this order");
        }

        // Exporter selon le format demandé
        if (format.ToLowerInvariant() == "pdf")
        {
            return ExportToPdf(order);
        }
        else if (format.ToLowerInvariant() == "csv")
        {
            return ExportToCsv(order);
        }
        else if (format.ToLowerInvariant() == "json")
        {
            return ExportToJson(order);
        }
        else
        {
            throw new ValidationException($"Unsupported format: {format}");
        }
    }

    /// <summary>
    /// Génère un numéro de commande unique.
    /// </summary>
    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
    }

    /// <summary>
    /// Exporte une commande au format PDF.
    /// </summary>
    private static byte[] ExportToPdf(Order order)
    {
        // À implémenter selon les besoins (iTextSharp, SelectPdf, etc.)
        throw new NotImplementedException("PDF export not yet implemented");
    }

    /// <summary>
    /// Exporte une commande au format CSV.
    /// </summary>
    private static byte[] ExportToCsv(Order order)
    {
        // À implémenter
        var csv = $"OrderNumber,UserId,TotalTtc,Status,CreatedAt\r\n";
        csv += $"{order.OrderNumber},{order.User.Id},{order.TotalTtc},{order.Status},{order.CreatedAt:yyyy-MM-dd}\r\n";

        return System.Text.Encoding.UTF8.GetBytes(csv);
    }

    /// <summary>
    /// Exporte une commande au format JSON.
    /// </summary>
    private static byte[] ExportToJson(Order order)
    {
        // À implémenter avec System.Text.Json ou JsonConvert
        throw new NotImplementedException("JSON export not yet implemented");
    }
}
