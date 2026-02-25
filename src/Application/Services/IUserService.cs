namespace Application.Services;

using Application.DTOs;
using Project.Domain.Exceptions;

/// <summary>
/// Service de gestion des utilisateurs.
/// Lève des exceptions du Domain:
/// - NotFoundException: si l'utilisateur n'existe pas
/// - ValidationException: si les données sont invalides
/// - ConflictException: si un conflit métier se produit (ex: email déjà utilisé)
/// - UnauthorizedException: si les identifiants sont incorrects
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Enregistre un nouvel utilisateur.
    /// </summary>
    /// <exception cref="ValidationException">Si les données sont invalides</exception>
    /// <exception cref="ConflictException">Si l'email existe déjà</exception>
    Task<AuthResultDto> RegisterAsync(RegisterUserDto dto);

    /// <summary>
    /// Authentifie un utilisateur avec email et mot de passe.
    /// </summary>
    /// <exception cref="UnauthorizedException">Si les identifiants sont incorrects</exception>
    Task<AuthResultDto> LoginAsync(LoginDto dto);

    /// <summary>
    /// Récupère le profil d'un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur n'existe pas</exception>
    Task<UserDto> GetProfileAsync(Guid userId);

    /// <summary>
    /// Met à jour le profil d'un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur n'existe pas</exception>
    /// <exception cref="ValidationException">Si les données sont invalides</exception>
    Task UpdateProfileAsync(Guid userId, UpdateUserDto dto);

    /// <summary>
    /// Confirme l'email d'un utilisateur via token.
    /// </summary>
    /// <exception cref="NotFoundException">Si le token est invalide</exception>
    /// <exception cref="ValidationException">Si le token est expiré</exception>
    Task ConfirmEmailAsync(string token);
}

public class RegisterUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class AuthResultDto
{
    public string AccessToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public string? RefreshToken { get; set; }
    public UserDto User { get; set; } = new();
}
