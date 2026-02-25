namespace Authentication.Models;

public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsRevoked => RevokedAt.HasValue;
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    public bool IsValid => !IsRevoked && !IsExpired;
}
