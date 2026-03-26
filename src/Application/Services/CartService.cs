namespace Application.Services;

using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Project.Domain.Entities;
using Project.Domain.Exceptions;

/// <summary>
/// Implémentation concrète du service de gestion du panier.
/// </summary>
public class CartService : ICartService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CartService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<CartDto> GetCartAsync(Guid? userId, string? sessionId)
    {
        Cart? cart = null;

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            cart = await _unitOfWork.CartRepository.GetByUserIdAsync(userId.Value);
        }
        else if (!string.IsNullOrWhiteSpace(sessionId))
        {
            cart = await _unitOfWork.CartRepository.GetBySessionIdAsync(sessionId);
        }

        if (cart == null)
        {
            throw new NotFoundException("Cart not found");
        }

        return MapCartToDto(cart);
    }

    public async Task<CartDto> GetOrCreateCartAsync(Guid cartId)
    {
        if (cartId == Guid.Empty) throw new ArgumentException("CartId cannot be empty", nameof(cartId));

        var cart = await _unitOfWork.CartRepository.GetByIdAsync(cartId);
        if (cart == null)
        {
            cart = new Cart(cartId);
            await _unitOfWork.CartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
        }

        return MapCartToDto(cart);
    }

    public async Task AddItemAsync(Guid cartId, Guid productId, int quantity)
    {
        if (cartId == Guid.Empty) throw new ArgumentException("CartId cannot be empty", nameof(cartId));
        if (productId == Guid.Empty) throw new ArgumentException("ProductId cannot be empty", nameof(productId));
        if (quantity <= 0) throw new ValidationException("Quantity must be positive");

        var cart = await _unitOfWork.CartRepository.GetByIdAsync(cartId);
        if (cart == null)
        {
            cart = new Cart(cartId);
            await _unitOfWork.CartRepository.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
        }

        var product = await _unitOfWork.ProductRepository.GetByIdAsync(productId);
        if (product == null)
        {
            throw new NotFoundException($"Product with id '{productId}' not found");
        }

        // Vérifier stock
        if (product.StockQuantity < quantity)
        {
            throw new ConflictException($"Insufficient stock. Available: {product.StockQuantity}, Requested: {quantity}");
        }

        // Créer un CartItem et l'ajouter au panier
        var cartItem = new CartItem(
            Guid.NewGuid(),
            cart,
            product,
            quantity,
            product.PriceTtc);

        cart.AddItem(cartItem);
        await _unitOfWork.CartRepository.UpdateAsync(cart);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task UpdateItemAsync(Guid itemId, int quantity)
    {
        if (itemId == Guid.Empty) throw new ArgumentException("ItemId cannot be empty", nameof(itemId));
        if (quantity <= 0) throw new ValidationException("Quantity must be positive");

        var cart = await _unitOfWork.CartRepository.GetByItemIdAsync(itemId);
        if (cart == null) throw new NotFoundException($"CartItem with id '{itemId}' not found");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null) throw new NotFoundException($"CartItem with id '{itemId}' not found");

        item.UpdateQuantity(quantity);
        await _unitOfWork.CartRepository.UpdateAsync(cart);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RemoveItemAsync(Guid itemId)
    {
        if (itemId == Guid.Empty) throw new ArgumentException("ItemId cannot be empty", nameof(itemId));

        var cart = await _unitOfWork.CartRepository.GetByItemIdAsync(itemId);
        if (cart == null) throw new NotFoundException($"CartItem with id '{itemId}' not found");

        cart.RemoveItem(itemId);
        await _unitOfWork.CartRepository.UpdateAsync(cart);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ClearCartAsync(Guid cartId)
    {
        if (cartId == Guid.Empty) throw new ArgumentException("CartId cannot be empty", nameof(cartId));

        var cart = await _unitOfWork.CartRepository.GetByIdAsync(cartId);
        if (cart == null)
        {
            throw new NotFoundException($"Cart with id '{cartId}' not found");
        }

        // Supprimer tous les items du panier
        // À adapter selon l'implémentation réelle
        // Pour l'instant, on suppose une méthode Clear ou une suppression manuelle

        await _unitOfWork.CartRepository.UpdateAsync(cart);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<Guid> CheckoutAsync(CheckoutDto dto, Guid userId)
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

        // Vérifier que l'AddressId figure parmi les adresses de l'utilisateur si fourni
        Address? billingAddress = null;
        Address? shippingAddress = null;

        if (dto.AddressId.HasValue && dto.AddressId.Value != Guid.Empty)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException($"User with id '{userId}' not found");
            }

            var address = user.Addresses.FirstOrDefault(a => a.Id == dto.AddressId.Value);
            if (address == null)
            {
                throw new ValidationException("Address not found for this user");
            }

            billingAddress = address;
            shippingAddress = address;
        }

        // Récupérer le PaymentMethod si fourni
        PaymentMethod? paymentMethod = null;
        if (dto.PaymentMethodId.HasValue && dto.PaymentMethodId.Value != Guid.Empty)
        {
            var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException($"User with id '{userId}' not found");
            }

            paymentMethod = user.PaymentMethods.FirstOrDefault(pm => pm.Id == dto.PaymentMethodId.Value);
            if (paymentMethod == null)
            {
                throw new ValidationException("PaymentMethod not found for this user");
            }
        }

        // Créer une commande depuis le panier
        var user2 = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user2 == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        var orderNumber = GenerateOrderNumber();
        var order = new Order(
            Guid.NewGuid(),
            orderNumber,
            user2,
            billingAddress!,
            shippingAddress!,
            paymentMethod!);

        // Ajouter les items du panier à la commande
        foreach (var cartItem in cart.Items)
        {
            var product = await _unitOfWork.ProductRepository.GetByIdAsync(cartItem.Product.Id);
            if (product == null)
            {
                throw new NotFoundException($"Product with id '{cartItem.Product.Id}' not found");
            }

            var orderItem = new OrderItem(
                Guid.NewGuid(),
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

    /// <summary>
    /// Mappe un Cart en CartDto avec calcul du total.
    /// </summary>
    private CartDto MapCartToDto(Cart cart)
    {
        var cartDto = _mapper.Map<CartDto>(cart);

        cartDto.TotalTtc   = cart.Items.Sum(item => item.UnitPriceTtc * item.Quantity);
        cartDto.SubtotalHt = cart.Items.Sum(item => item.Product != null ? item.Product.PriceHt * item.Quantity : 0m);
        cartDto.TotalTva   = cartDto.TotalTtc - cartDto.SubtotalHt;
        cartDto.Total      = cartDto.TotalTtc;

        return cartDto;
    }

    /// <summary>
    /// Génère un numéro de commande unique.
    /// </summary>
    private static string GenerateOrderNumber()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
    }
}
