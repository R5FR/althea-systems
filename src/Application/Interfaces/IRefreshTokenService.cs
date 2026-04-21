namespace Application.Interfaces;

/// <summary>
/// Service de gestion des refresh tokens (stockage et validation).
/// </summary>
public interface IRefreshTokenService
{
    void Store(Guid userId, string token, DateTime expiresAt);
    Guid? Validate(string token);
    void Revoke(string token);
}
