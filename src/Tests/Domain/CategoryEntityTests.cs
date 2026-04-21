using FluentAssertions;
using Project.Domain.Entities;
using Project.Domain.Enums;
using Project.Domain.Exceptions;

namespace Tests.Domain;

public class CategoryEntityTests
{
    private static Category CreateValidCategory() =>
        new(Guid.NewGuid(), "Électronique", "desc", "http://img.com/cat.jpg", "electronique");

    [Fact]
    public void Constructor_ValidArgs_SetsProperties()
    {
        var id = Guid.NewGuid();
        var cat = new Category(id, "Test", "desc", "img.jpg", "test-slug");

        cat.Id.Should().Be(id);
        cat.Name.Should().Be("Test");
        cat.Status.Should().Be(CategoryStatus.Active);
        cat.Parent.Should().BeNull();
    }

    [Fact]
    public void Constructor_EmptyGuid_ThrowsValidationException()
    {
        var act = () => new Category(Guid.Empty, "Test", "desc", "img", "slug");
        act.Should().Throw<ValidationException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_EmptyName_ThrowsValidationException(string name)
    {
        var act = () => new Category(Guid.NewGuid(), name, "desc", "img", "slug");
        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Constructor_WithParent_SetsParent()
    {
        var parent = CreateValidCategory();
        var child = new Category(Guid.NewGuid(), "Sous-cat", "desc", "img", "sous-cat", parent);
        child.Parent.Should().Be(parent);
    }

    [Fact]
    public void Update_ValidArgs_UpdatesProperties()
    {
        var cat = CreateValidCategory();
        cat.Update("Nouveau Nom", "nouvelle desc", "newimg.jpg", "nouveau-slug", 5);
        cat.Name.Should().Be("Nouveau Nom");
        cat.Slug.Should().Be("nouveau-slug");
        cat.DisplayOrder.Should().Be(5);
    }

    [Fact]
    public void Update_EmptyName_ThrowsValidationException()
    {
        var cat = CreateValidCategory();
        var act = () => cat.Update("", "desc", "img", "slug", 0);
        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void SetStatus_Inactive_SetsStatus()
    {
        var cat = CreateValidCategory();
        cat.SetStatus(CategoryStatus.Inactive);
        cat.Status.Should().Be(CategoryStatus.Inactive);
    }
}
