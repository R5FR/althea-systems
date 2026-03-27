# Authentication Project

## Description
Le projet **Authentication** gère toute l'authentification et l'autorisation JWT pour l'API B3. Il fournit la génération et validation de tokens, la gestion des refresh tokens, et les policies d'autorisation.

## Architecture

```
Authentication/
├── Settings/
│   └── JwtSettings.cs           # Configuration JWT
├── Models/
│   ├── JwtTokenIdentity.cs      # Données pour créer un token
│   ├── JwtTokenResponse.cs      # Token retourné au client
│   └── RefreshToken.cs          # Entity du refresh token
├── Services/
│   ├── IJwtService.cs           # Interface du service JWT
│   └── JwtService.cs            # Implémentation
├── Repositories/
│   └── IRefreshTokenRepository.cs # Interface pour les refresh tokens
├── Policies/
│   └── AuthorizationPolicies.cs  # Policies d'autorisation
└── Extensions/
    └── AuthenticationServiceExtensions.cs # DI & middleware
```

## Configuration

### Dépendances
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT Bearer authentication
- **System.IdentityModel.Tokens.Jwt** - JWT token creation/validation
- **Microsoft.IdentityModel.Tokens** - Token security utilities

### Intégration dans Program.cs

```csharp
// Enregistrement des services
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorization(options => 
    options.AddAuthorizationPolicies());

// Dans le middleware pipeline
app.UseJwtAuthentication(); // UseAuthentication() + UseAuthorization()
```

### Configuration appsettings.json

```json
{
  "Jwt": {
    "Issuer": "https://b3.local",
    "Audience": "b3-api",
    "Key": "your-super-secret-jwt-key-min-256-bits-long",
    "AccessTokenExpiry": 3600,
    "RefreshTokenExpiry": 604800
  }
}
```

## Services

### IJwtService

**GenerateTokenAsync(identity)**
- Crée un access token + refresh token
- Accepts: JwtTokenIdentity (userId, email, role, additionalClaims)
- Returns: JwtTokenResponse (accessToken, expiresIn, refreshToken)

**ValidateToken(token)**
- Valide un access token
- Returns: ClaimsPrincipal avec les claims du token
- Throws: UnauthorizedException si invalid

**GenerateRefreshToken()**
- Génère un refresh token cryptographiquement sûr
- Returns: Token string (base64)

**ValidateRefreshToken(refreshToken)**
- Vérifie qu'un refresh token n'est pas révoqué ou expiré
- Returns: bool

## Policies d'Autorisation

| Policy | Description | Usage |
|--------|-------------|-------|
| `RequireAdminRole` | Require admin role | `[Authorize(Policy = "RequireAdminRole")]` |
| `RequireAuthenticatedUser` | Require authenticated | `[Authorize(Policy = "RequireAuthenticatedUser")]` ou `[Authorize]` |

## Token Claims

L'access token contient:
- `sub` - User ID
- `email` - User email
- `role` - User role (admin/user)
- `exp` - Expiration timestamp
- `iat` - Issued at timestamp
- `iss` - Issuer
- `aud` - Audience

**Exemple:**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "user",
  "exp": 1729000000,
  "iat": 1728996400,
  "iss": "https://b3.local",
  "aud": "b3-api"
}
```

## Refresh Token Flow

1. **Initial Login** → Server génère access token + refresh token
2. **Access Token Expiry** → Client utilise refresh token
3. **Refresh Endpoint** → Server valide refresh token, génère nouveau access token
4. **Invalid Refresh Token** → Client doit re-login
5. **Logout** → Server révoque le refresh token

## Security Features

✅ **HMAC-SHA256** signing
✅ **Expiration validation** avec ClockSkew = 0
✅ **Issuer/Audience validation**
✅ **Refresh token rotation** capability
✅ **Token revocation** support
✅ **Cryptographically secure** refresh token generation

## Error Handling

Au niveau authentification, les exceptions Domain sont levées:
- **UnauthorizedException** - Token invalid/expired, invalid credentials
- **ValidationException** - Invalid parameters

Ces exceptions sont mappées par le middleware ErrorHandling vers:
- 401 Unauthorized
- 403 Forbidden

## Prochaines Étapes

1. **Créer RefreshTokenRepository** dans le projet DAL
2. **Implémenter les services métier** (UserService, etc.) pour utiliser IJwtService
3. **Ajouter RefreshToken entity** dans EF Core
4. **Configurer 2FA** pour les admins (optionnel)
5. **Ajouter token refresh endpoints** dans Web controllers
6. **Implémenter token invalidation** sur logout
