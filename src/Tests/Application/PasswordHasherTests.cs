using Application.Services;
using FluentAssertions;

namespace Tests.Application;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_ReturnsNonEmptyString()
    {
        var hash = _hasher.Hash("MonMotDePasse");
        hash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Hash_SamePassword_ReturnsDifferentHashes()
    {
        // Chaque hash inclut un salt aléatoire
        var h1 = _hasher.Hash("MotDePasse");
        var h2 = _hasher.Hash("MotDePasse");
        h1.Should().NotBe(h2);
    }

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        var hash = _hasher.Hash("MonMotDePasse");
        _hasher.Verify(hash, "MonMotDePasse").Should().BeTrue();
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = _hasher.Hash("MonMotDePasse");
        _hasher.Verify(hash, "MauvaisMotDePasse").Should().BeFalse();
    }

    [Fact]
    public void Verify_TamperedHash_ReturnsFalse()
    {
        _hasher.Verify("tampered.hash", "MotDePasse").Should().BeFalse();
    }

    [Fact]
    public void Verify_EmptyHash_ReturnsFalse()
    {
        _hasher.Verify("", "MotDePasse").Should().BeFalse();
    }
}
