using FluentAssertions;
using Project.Domain.Exceptions;
using Project.Domain.ValueObjects;

namespace Tests.Domain;

public class EmailAddressTests
{
    [Theory]
    [InlineData("user@example.com")]
    [InlineData("USER@EXAMPLE.COM")]
    [InlineData("user.name+tag@domain.co")]
    [InlineData("a@b.io")]
    public void Constructor_ValidEmail_CreatesInstance(string email)
    {
        var result = new EmailAddress(email);
        result.Value.Should().Be(email.Trim().ToLowerInvariant());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_NullOrEmpty_ThrowsValidationException(string? email)
    {
        var act = () => new EmailAddress(email!);
        act.Should().Throw<ValidationException>();
    }

    [Theory]
    [InlineData("notanemail")]
    [InlineData("@domain.com")]
    [InlineData("user@")]
    [InlineData("user @domain.com")]
    public void Constructor_InvalidFormat_ThrowsValidationException(string email)
    {
        var act = () => new EmailAddress(email);
        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void ToString_ReturnsValue()
    {
        var email = new EmailAddress("Test@Example.COM");
        email.ToString().Should().Be("test@example.com");
    }
}
