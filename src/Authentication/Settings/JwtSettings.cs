namespace Authentication.Settings;

public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public int AccessTokenExpiry { get; set; } = 3600; // 1 hour in seconds
    public int RefreshTokenExpiry { get; set; } = 604800; // 7 days in seconds
}
