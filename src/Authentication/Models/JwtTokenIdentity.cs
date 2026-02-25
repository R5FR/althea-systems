namespace Authentication.Models;

using System.Security.Claims;

public class JwtTokenIdentity
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<Claim> AdditionalClaims { get; set; } = new();
}
