namespace Authentication.Services;

using Authentication.Models;
using Authentication.Settings;
using Project.Domain.Exceptions;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

public class JwtService : IJwtService
{
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<JwtService> _logger;

    public JwtService(JwtSettings jwtSettings, ILogger<JwtService> logger)
    {
        _jwtSettings = jwtSettings;
        _logger = logger;
    }

    public async Task<JwtTokenResponse> GenerateTokenAsync(JwtTokenIdentity identity)
    {
        if (identity == null)
            throw new ValidationException("Identity cannot be null");

        if (string.IsNullOrWhiteSpace(identity.UserId))
            throw new ValidationException("UserId cannot be null or empty");

        try
        {
            var accessToken = GenerateAccessToken(identity);
            var refreshToken = GenerateRefreshToken();

            var response = new JwtTokenResponse
            {
                AccessToken = accessToken,
                ExpiresIn = _jwtSettings.AccessTokenExpiry,
                RefreshToken = refreshToken,
                TokenType = "Bearer"
            };

            return await Task.FromResult(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating JWT token for user {UserId}", identity.UserId);
            throw new DomainException("Failed to generate JWT token", ex);
        }
    }

    public ClaimsPrincipal ValidateToken(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new UnauthorizedException("Token cannot be null or empty");

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);

            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return principal;
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning(ex, "Token validation failed");
            throw new UnauthorizedException("Invalid or expired token");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error validating token");
            throw new UnauthorizedException("Token validation error");
        }
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    public bool ValidateRefreshToken(RefreshToken refreshToken)
    {
        if (refreshToken == null)
            return false;

        return refreshToken.IsValid;
    }

    private string GenerateAccessToken(JwtTokenIdentity identity)
    {
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Key);
        var tokenHandler = new JwtSecurityTokenHandler();

        var claims = new List<Claim>
        {
            new Claim("sub", identity.UserId),
            new Claim("email", identity.Email),
            new Claim(ClaimTypes.Role, identity.Role)
        };

        if (identity.AdditionalClaims != null && identity.AdditionalClaims.Count > 0)
            claims.AddRange(identity.AdditionalClaims);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddSeconds(_jwtSettings.AccessTokenExpiry),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
