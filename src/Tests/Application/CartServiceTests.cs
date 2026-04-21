using Application.Interfaces;
using Application.Services;
using AutoMapper;
using FluentAssertions;
using Moq;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Project.Domain.ValueObjects;

namespace Tests.Application;

public class CartServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<ICartRepository> _cartRepo = new();
    private readonly Mock<IProductRepository> _productRepo = new();
    private readonly Mock<IMapper> _mapper = new();
    private readonly CartService _sut;

    public CartServiceTests()
    {
        _uow.Setup(u => u.CartRepository).Returns(_cartRepo.Object);
        _uow.Setup(u => u.ProductRepository).Returns(_productRepo.Object);
        _sut = new CartService(_uow.Object, _mapper.Object);
    }

    private static User MakeUser() =>
        new(Guid.NewGuid(), "A", "B", new EmailAddress("a@b.fr"), "hash");

    private static Category MakeCategory() =>
        new(Guid.NewGuid(), "Cat", "desc", "", "cat");

    private static Product MakeProduct(int stock = 10) =>
        new(Guid.NewGuid(), "Produit", "desc", 100m, 20m, stock, MakeCategory(), "produit");

    // ── GetCartAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetCartAsync_NoUserNoSession_ThrowsNotFoundException()
    {
        _cartRepo.Setup(r => r.GetByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync((Cart?)null);
        _cartRepo.Setup(r => r.GetBySessionIdAsync(It.IsAny<string>())).ReturnsAsync((Cart?)null);

        Func<Task> act = () => _sut.GetCartAsync(null, null);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── AddItemAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task AddItemAsync_EmptyCartId_ThrowsArgumentException()
    {
        Func<Task> act = () => _sut.AddItemAsync(Guid.Empty, Guid.NewGuid(), 1);
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task AddItemAsync_EmptyProductId_ThrowsArgumentException()
    {
        Func<Task> act = () => _sut.AddItemAsync(Guid.NewGuid(), Guid.Empty, 1);
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task AddItemAsync_ZeroQuantity_ThrowsValidationException()
    {
        Func<Task> act = () => _sut.AddItemAsync(Guid.NewGuid(), Guid.NewGuid(), 0);
        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task AddItemAsync_CartNotFound_ThrowsNotFoundException()
    {
        _cartRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Cart?)null);
        Func<Task> act = () => _sut.AddItemAsync(Guid.NewGuid(), Guid.NewGuid(), 1);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task AddItemAsync_ProductNotFound_ThrowsNotFoundException()
    {
        var cart = new Cart(Guid.NewGuid(), MakeUser());
        _cartRepo.Setup(r => r.GetByIdAsync(cart.Id)).ReturnsAsync(cart);
        _productRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Product?)null);

        Func<Task> act = () => _sut.AddItemAsync(cart.Id, Guid.NewGuid(), 1);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task AddItemAsync_InsufficientStock_ThrowsConflictException()
    {
        var cart = new Cart(Guid.NewGuid(), MakeUser());
        var product = MakeProduct(stock: 2);
        _cartRepo.Setup(r => r.GetByIdAsync(cart.Id)).ReturnsAsync(cart);
        _productRepo.Setup(r => r.GetByIdAsync(product.Id)).ReturnsAsync(product);

        Func<Task> act = () => _sut.AddItemAsync(cart.Id, product.Id, 5);
        await act.Should().ThrowAsync<ConflictException>();
    }
}
