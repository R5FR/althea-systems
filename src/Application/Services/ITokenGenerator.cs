namespace Application.Services;

/// <summary>
/// Interface pour la génération de tokens.
/// À implémenter par le projet Authentication.
/// </summary>
public interface ITokenGenerator
{
    /// <summary>
    /// Génère un access token et un refresh token pour un utilisateur.
    /// </summary>
    /// <param name="userId">L'ID de l'utilisateur</param>
    /// <param name="email">L'email de l'utilisateur</param>
    /// <param name="role">Le rôle de l'utilisateur</param>
    /// <returns>Un objet TokenResult contenant les tokens</returns>
    Task<TokenResult> GenerateTokenAsync(Guid userId, string email, string role);
}

/// <summary>
/// Résultat de la génération de tokens.
/// </summary>
public class TokenResult
{
    public string AccessToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
}
