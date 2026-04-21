using Authentication.Models;
using Authentication.Services;
using Authentication.Settings;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Project.Domain.Exceptions;

namespace Tests.Authentication;

public class JwtServiceTests
{
    private readonly JwtService _sut;

    private static JwtSettings MakeSettings() => new()
    {
        Key = "SuperSecretTestKeyMustBe256BitsLong!!",
        Issuer = "https://test.local",
        Audience = "test-api",
        AccessTokenExpiry = 3600,
        RefreshTokenExpiry = 604800
    };

    public JwtServiceTests()
    {
        var logger = new Mock<ILogger<JwtService>>();
        _sut = new JwtService(MakeSettings(), logger.Object);
    }

    private static JwtTokenIdentity MakeIdentity() => new()
    {
        UserId = Guid.NewGuid().ToString(),
        Email = "test@test.fr",
        Role = "User"
    };

    // ── GenerateTokenAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task GenerateTokenAsync_ValidIdentity_ReturnsTokenResponse()
    {
        var identity = MakeIdentity();
        var result = await _sut.GenerateTokenAsync(identity);

        result.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.TokenType.Should().Be("Bearer");
        result.ExpiresIn.Should().Be(3600);
    }

    [Fact]
    public async Task GenerateTokenAsync_NullIdentity_ThrowsValidationException()
    {
        var act = () => _sut.GenerateTokenAsync(null!);
        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task GenerateTokenAsync_EmptyUserId_ThrowsValidationException()
    {
        var identity = MakeIdentity();
        identity.UserId = "";
        var act = () => _sut.GenerateTokenAsync(identity);
        await act.Should().ThrowAsync<ValidationException>();
    }

    // ── ValidateToken ─────────────────────────────────────────────────────────

    [Fact]
    public async Task ValidateToken_ValidToken_ReturnsPrincipal()
    {
        var identity = MakeIdentity();
        var tokenResponse = await _sut.GenerateTokenAsync(identity);

        var principal = _sut.ValidateToken(tokenResponse.AccessToken);
        principal.Should().NotBeNull();
        principal.FindFirst("sub")?.Value.Should().Be(identity.UserId);
    }

    [Fact]
    public void ValidateToken_EmptyToken_ThrowsUnauthorizedException()
    {
        var act = () => _sut.ValidateToken("");
        act.Should().Throw<UnauthorizedException>();
    }

    [Fact]
    public void ValidateToken_InvalidToken_ThrowsUnauthorizedException()
    {
        var act = () => _sut.ValidateToken("not.a.valid.jwt.token");
        act.Should().Throw<UnauthorizedException>();
    }

    [Fact]
    public void ValidateToken_WrongKey_ThrowsUnauthorizedException()
    {
        // Token généré avec une autre clé
        var otherSettings = new JwtSettings
        {
            Key = "AnotherCompletelyDifferentSecretKey!!",
            Issuer = "https://test.local",
            Audience = "test-api",
            AccessTokenExpiry = 3600,
            RefreshTokenExpiry = 604800
        };
        var otherService = new JwtService(otherSettings, new Mock<ILogger<JwtService>>().Object);
        var tokenFromOtherService = otherService.GenerateTokenAsync(MakeIdentity()).Result.AccessToken;

        var act = () => _sut.ValidateToken(tokenFromOtherService);
        act.Should().Throw<UnauthorizedException>();
    }

    // ── GenerateRefreshToken ──────────────────────────────────────────────────

    [Fact]
    public void GenerateRefreshToken_ReturnsNonEmptyString()
    {
        var token = _sut.GenerateRefreshToken();
        token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void GenerateRefreshToken_CalledTwice_ReturnsDifferentTokens()
    {
        var t1 = _sut.GenerateRefreshToken();
        var t2 = _sut.GenerateRefreshToken();
        t1.Should().NotBe(t2);
    }

    // ── ValidateRefreshToken ──────────────────────────────────────────────────

    [Fact]
    public void ValidateRefreshToken_NullToken_ReturnsFalse()
    {
        var result = _sut.ValidateRefreshToken(null!);
        result.Should().BeFalse();
    }
}
