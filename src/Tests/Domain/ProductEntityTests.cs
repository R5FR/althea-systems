using FluentAssertions;
using Project.Domain.Entities;
using Project.Domain.Exceptions;

namespace Tests.Domain;

public class ProductEntityTests
{
    private static Category CreateCategory() => new(
        Guid.NewGuid(), "Cat", "desc", "", "cat-slug");

    private static Product CreateValidProduct() => new(
        Guid.NewGuid(), "Produit Test", "Description", 100m, 20m, 10, CreateCategory(), "produit-test");

    // ── Constructor ──────────────────────────────────────────────────────────

    [Fact]
    public void Constructor_ValidArgs_SetsPriceTtcCorrectly()
    {
        var product = new Product(Guid.NewGuid(), "Test", "desc", 100m, 20m, 5, CreateCategory(), "slug");
        product.PriceTtc.Should().Be(120m);
    }

    [Fact]
    public void Constructor_EmptyGuid_ThrowsValidationException()
    {
        var act = () => new Product(Guid.Empty, "Test", "desc", 100m, 20m, 5, CreateCategory(), "slug");
        act.Should().Throw<ValidationException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_EmptyName_ThrowsValidationException(string name)
    {
        var act = () => new Product(Guid.NewGuid(), name, "desc", 100m, 20m, 5, CreateCategory(), "slug");
        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Constructor_NegativePrice_ThrowsValidationException()
    {
        var act = () => new Product(Guid.NewGuid(), "Test", "desc", -1m, 20m, 5, CreateCategory(), "slug");
        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Constructor_NegativeStock_ThrowsValidationException()
    {
        var act = () => new Product(Guid.NewGuid(), "Test", "desc", 100m, 20m, -1, CreateCategory(), "slug");
        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Constructor_NullCategory_ThrowsValidationException()
    {
        var act = () => new Product(Guid.NewGuid(), "Test", "desc", 100m, 20m, 5, null!, "slug");
        act.Should().Throw<ValidationException>();
    }

    // ── DecreaseStock ────────────────────────────────────────────────────────

    [Fact]
    public void DecreaseStock_ValidQty_DecreasesStock()
    {
        var product = CreateValidProduct();
        product.DecreaseStock(3);
        product.StockQuantity.Should().Be(7);
    }

    [Fact]
    public void DecreaseStock_ExactStock_SetsZero()
    {
        var product = CreateValidProduct();
        product.DecreaseStock(10);
        product.StockQuantity.Should().Be(0);
    }

    [Fact]
    public void DecreaseStock_MoreThanStock_ThrowsDomainException()
    {
        var product = CreateValidProduct();
        var act = () => product.DecreaseStock(11);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void DecreaseStock_ZeroQty_ThrowsValidationException()
    {
        var product = CreateValidProduct();
        var act = () => product.DecreaseStock(0);
        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void DecreaseStock_NegativeQty_ThrowsValidationException()
    {
        var product = CreateValidProduct();
        var act = () => product.DecreaseStock(-1);
        act.Should().Throw<ValidationException>();
    }

    // ── IncreaseStock ────────────────────────────────────────────────────────

    [Fact]
    public void IncreaseStock_ValidQty_IncreasesStock()
    {
        var product = CreateValidProduct();
        product.IncreaseStock(5);
        product.StockQuantity.Should().Be(15);
    }

    [Fact]
    public void IncreaseStock_ZeroQty_ThrowsValidationException()
    {
        var product = CreateValidProduct();
        var act = () => product.IncreaseStock(0);
        act.Should().Throw<ValidationException>();
    }
}
