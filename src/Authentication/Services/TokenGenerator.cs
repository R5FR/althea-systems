namespace Authentication.Services;

using Application.Services;
using Authentication.Models;

/// <summary>
/// Implémentation de ITokenGenerator pour l'Application layer.
/// Adapte IJwtService aux besoins du layer Application.
/// </summary>
public class TokenGenerator : ITokenGenerator
{
    private readonly IJwtService _jwtService;

    public TokenGenerator(IJwtService jwtService)
    {
        _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
    }

    public async Task<TokenResult> GenerateTokenAsync(Guid userId, string email, string role)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required", nameof(email));
        if (string.IsNullOrWhiteSpace(role)) throw new ArgumentException("Role is required", nameof(role));

        var jwtIdentity = new JwtTokenIdentity
        {
            UserId = userId.ToString(),
            Email = email,
            Role = role
        };

        var jwtResponse = await _jwtService.GenerateTokenAsync(jwtIdentity);

        return new TokenResult
        {
            AccessToken = jwtResponse.AccessToken,
            ExpiresIn = jwtResponse.ExpiresIn,
            RefreshToken = jwtResponse.RefreshToken ?? string.Empty
        };
    }
}
