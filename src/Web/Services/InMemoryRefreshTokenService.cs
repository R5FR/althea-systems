namespace Web.Services;

using Application.Interfaces;
using System.Collections.Concurrent;

/// <summary>
/// Implémentation en mémoire du service de refresh tokens.
/// Les tokens sont perdus au redémarrage du serveur (suffisant pour ce projet).
/// </summary>
public class InMemoryRefreshTokenService : IRefreshTokenService
{
    private record TokenEntry(Guid UserId, DateTime ExpiresAt);

    private readonly ConcurrentDictionary<string, TokenEntry> _tokens = new();

    public void Store(Guid userId, string token, DateTime expiresAt)
    {
        _tokens[token] = new TokenEntry(userId, expiresAt);
    }

    public Guid? Validate(string token)
    {
        if (_tokens.TryGetValue(token, out var entry))
        {
            if (DateTime.UtcNow <= entry.ExpiresAt)
                return entry.UserId;
            _tokens.TryRemove(token, out _);
        }
        return null;
    }

    public void Revoke(string token)
    {
        _tokens.TryRemove(token, out _);
    }
}
