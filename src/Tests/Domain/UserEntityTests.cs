using FluentAssertions;
using Project.Domain.Entities;
using Project.Domain.Enums;
using Project.Domain.Exceptions;
using Project.Domain.ValueObjects;

namespace Tests.Domain;

public class UserEntityTests
{
    private static User CreateValidUser(Role role = Role.User) => new(
        Guid.NewGuid(),
        "Jean",
        "Dupont",
        new EmailAddress("jean.dupont@test.fr"),
        "hashedpassword",
        role);

    // ── Constructor ──────────────────────────────────────────────────────────

    [Fact]
    public void Constructor_ValidArgs_SetsProperties()
    {
        var id = Guid.NewGuid();
        var email = new EmailAddress("test@test.fr");
        var user = new User(id, "Jean", "Dupont", email, "hash");

        user.Id.Should().Be(id);
        user.FirstName.Should().Be("Jean");
        user.LastName.Should().Be("Dupont");
        user.Email.Should().Be(email);
        user.AccountStatus.Should().Be(AccountStatus.Active);
        user.Role.Should().Be(Role.User);
    }

    [Fact]
    public void Constructor_EmptyGuid_ThrowsValidationException()
    {
        var act = () => new User(Guid.Empty, "Jean", "Dupont", new EmailAddress("a@b.fr"), "hash");
        act.Should().Throw<ValidationException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_EmptyFirstName_ThrowsValidationException(string firstName)
    {
        var act = () => new User(Guid.NewGuid(), firstName, "Dupont", new EmailAddress("a@b.fr"), "hash");
        act.Should().Throw<ValidationException>();
    }

    [Fact]
    public void Constructor_NullEmail_ThrowsValidationException()
    {
        var act = () => new User(Guid.NewGuid(), "Jean", "Dupont", null!, "hash");
        act.Should().Throw<ValidationException>();
    }

    // ── Activate / Deactivate ────────────────────────────────────────────────

    [Fact]
    public void Deactivate_SetsStatusInactive()
    {
        var user = CreateValidUser();
        user.Deactivate();
        user.AccountStatus.Should().Be(AccountStatus.Inactive);
    }

    [Fact]
    public void Activate_AfterDeactivate_SetsStatusActive()
    {
        var user = CreateValidUser();
        user.Deactivate();
        user.Activate();
        user.AccountStatus.Should().Be(AccountStatus.Active);
    }

    // ── UpdateName ───────────────────────────────────────────────────────────

    [Fact]
    public void UpdateName_ValidArgs_UpdatesName()
    {
        var user = CreateValidUser();
        user.UpdateName("Marie", "Curie");
        user.FirstName.Should().Be("Marie");
        user.LastName.Should().Be("Curie");
    }

    [Fact]
    public void UpdateName_EmptyFirstName_ThrowsValidationException()
    {
        var user = CreateValidUser();
        var act = () => user.UpdateName("", "Curie");
        act.Should().Throw<ValidationException>();
    }

    // ── SetPasswordHash ──────────────────────────────────────────────────────

    [Fact]
    public void SetPasswordHash_ValidHash_UpdatesHash()
    {
        var user = CreateValidUser();
        user.SetPasswordHash("newhash");
        user.PasswordHash.Should().Be("newhash");
    }

    [Fact]
    public void SetPasswordHash_Empty_ThrowsValidationException()
    {
        var user = CreateValidUser();
        var act = () => user.SetPasswordHash("");
        act.Should().Throw<ValidationException>();
    }

    // ── Addresses ────────────────────────────────────────────────────────────

    [Fact]
    public void RemoveAddress_NotFound_ThrowsNotFoundException()
    {
        var user = CreateValidUser();
        var act = () => user.RemoveAddress(Guid.NewGuid());
        act.Should().Throw<NotFoundException>();
    }

    // ── PasswordResetToken ───────────────────────────────────────────────────

    [Fact]
    public void SetPasswordResetToken_ValidArgs_SetsToken()
    {
        var user = CreateValidUser();
        var expiry = DateTime.UtcNow.AddHours(1);
        user.SetPasswordResetToken("resettoken", expiry);
        user.PasswordResetToken.Should().Be("resettoken");
        user.PasswordResetTokenExpiry.Should().Be(expiry);
    }

    [Fact]
    public void ClearPasswordResetToken_ClearsToken()
    {
        var user = CreateValidUser();
        user.SetPasswordResetToken("token", DateTime.UtcNow.AddHours(1));
        user.ClearPasswordResetToken();
        user.PasswordResetToken.Should().BeNull();
        user.PasswordResetTokenExpiry.Should().BeNull();
    }
}
