using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using FluentAssertions;
using Moq;
using Project.Domain.Entities;
using Project.Domain.Exceptions;

namespace Tests.Application;

public class ProductServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IProductRepository> _productRepo = new();
    private readonly Mock<IMapper> _mapper = new();
    private readonly ProductService _sut;

    public ProductServiceTests()
    {
        _uow.Setup(u => u.ProductRepository).Returns(_productRepo.Object);
        _sut = new ProductService(_uow.Object, _mapper.Object);
    }

    private static Category MakeCategory() =>
        new(Guid.NewGuid(), "Cat", "desc", "", "cat");

    private static Product MakeProduct() =>
        new(Guid.NewGuid(), "Produit", "desc", 100m, 20m, 10, MakeCategory(), "produit");

    // ── GetByIdAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_EmptyGuid_ThrowsArgumentException()
    {
        Func<Task> act = () => _sut.GetByIdAsync(Guid.Empty);
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task GetByIdAsync_NotFound_ThrowsNotFoundException()
    {
        _productRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Product?)null);
        Func<Task> act = () => _sut.GetByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetByIdAsync_Found_ReturnsDto()
    {
        var product = MakeProduct();
        _productRepo.Setup(r => r.GetByIdAsync(product.Id)).ReturnsAsync(product);
        _mapper.Setup(m => m.Map<ProductDto>(product)).Returns(new ProductDto { Id = product.Id });

        var result = await _sut.GetByIdAsync(product.Id);
        result.Id.Should().Be(product.Id);
    }

    // ── SearchAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task SearchAsync_NullParams_ThrowsArgumentNullException()
    {
        Func<Task> act = () => _sut.SearchAsync(null!);
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task SearchAsync_PageNumberZero_ThrowsValidationException()
    {
        Func<Task> act = () => _sut.SearchAsync(new ProductSearchParams { PageNumber = 0, PageSize = 10 });
        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task SearchAsync_ValidParams_ReturnsPaginatedResult()
    {
        var products = new List<Product> { MakeProduct(), MakeProduct() };
        _productRepo.Setup(r => r.SearchAsync(null, null, null, null, 0, 10)).ReturnsAsync(products);
        _productRepo.Setup(r => r.CountAsync(null, null, null, null)).ReturnsAsync(2);
        var dtos = new List<ProductListItemDto> { new(), new() };
        _mapper.Setup(m => m.Map<List<ProductListItemDto>>(It.IsAny<object>())).Returns(dtos);

        var result = await _sut.SearchAsync(new ProductSearchParams { PageNumber = 1, PageSize = 10 });

        result.TotalCount.Should().Be(2);
        result.Items.Should().HaveCount(2);
    }

    // ── GetTopProductsAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task GetTopProductsAsync_ValidLimit_ReturnsList()
    {
        var products = new List<Product> { MakeProduct() };
        _productRepo.Setup(r => r.GetTopProductsAsync(5)).ReturnsAsync(products);
        var dtos = new List<ProductListItemDto> { new() };
        _mapper.Setup(m => m.Map<List<ProductListItemDto>>(It.IsAny<object>())).Returns(dtos);

        var result = await _sut.GetTopProductsAsync(5);
        result.Should().HaveCount(1);
    }
}
