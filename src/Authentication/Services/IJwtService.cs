namespace Authentication.Services;

using Authentication.Models;
using System.Security.Claims;

/// <summary>
/// Service de gestion des tokens JWT.
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Génère une paire de tokens (access token + refresh token).
    /// </summary>
    Task<JwtTokenResponse> GenerateTokenAsync(JwtTokenIdentity identity);

    /// <summary>
    /// Valide un access token et retourne les claims.
    /// </summary>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">Si le token est invalide</exception>
    ClaimsPrincipal ValidateToken(string token);

    /// <summary>
    /// Génère un refresh token.
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// Valide un refresh token.
    /// </summary>
    bool ValidateRefreshToken(RefreshToken refreshToken);
}
