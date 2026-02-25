namespace Authentication.Repositories;

using Authentication.Models;
using Domain.Exceptions;

/// <summary>
/// Repository pour la gestion des refresh tokens.
/// Lève des exceptions du Domain:
/// - NotFoundException: si le token n'existe pas
/// - ValidationException: si les données sont invalides
/// </summary>
public interface IRefreshTokenRepository
{
    /// <summary>
    /// Sauvegarde un refresh token.
    /// </summary>
    /// <exception cref="ValidationException">Si les données sont invalides</exception>
    Task SaveRefreshTokenAsync(Guid userId, string token, DateTime expiresAt);

    /// <summary>
    /// Récupère un refresh token.
    /// </summary>
    /// <exception cref="NotFoundException">Si le token n'existe pas</exception>
    Task<RefreshToken> GetRefreshTokenAsync(string token);

    /// <summary>
    /// Révoque un refresh token.
    /// </summary>
    /// <exception cref="NotFoundException">Si le token n'existe pas</exception>
    Task RevokeRefreshTokenAsync(string token);

    /// <summary>
    /// Récupère tous les tokens d'un utilisateur.
    /// </summary>
    Task<List<RefreshToken>> GetUserRefreshTokensAsync(Guid userId);

    /// <summary>
    /// Révoque tous les tokens d'un utilisateur (logout de tous les appareils).
    /// </summary>
    Task RevokeAllUserTokensAsync(Guid userId);

    /// <summary>
    /// Nettoie les tokens expirés.
    /// </summary>
    Task CleanupExpiredTokensAsync();
}
