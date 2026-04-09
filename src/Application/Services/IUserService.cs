namespace Application.Services;

using Application.DTOs;
using Project.Domain.Exceptions;
using System.Collections.Generic;

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

    /// <summary>
    /// Rafraîchit les tokens d'accès via un refresh token valide.
    /// </summary>
    /// <exception cref="UnauthorizedException">Si le refresh token est invalide ou expiré</exception>
    Task<AuthResultDto> RefreshTokenAsync(RefreshTokenDto dto);

    /// <summary>
    /// Initie le processus de réinitialisation de mot de passe (log le token).
    /// </summary>
    /// <exception cref="NotFoundException">Si l'email n'existe pas</exception>
    Task ForgotPasswordAsync(ForgotPasswordDto dto);

    /// <summary>
    /// Réinitialise le mot de passe via un token valide.
    /// </summary>
    /// <exception cref="NotFoundException">Si le token est invalide</exception>
    /// <exception cref="ValidationException">Si le token est expiré ou le mot de passe invalide</exception>
    Task ResetPasswordAsync(ResetPasswordDto dto);

    /// <summary>
    /// Récupère toutes les adresses d'un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur n'existe pas</exception>
    Task<List<AddressDto>> GetAddressesAsync(Guid userId);

    /// <summary>
    /// Ajoute une adresse à un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur n'existe pas</exception>
    /// <exception cref="ValidationException">Si les données sont invalides</exception>
    Task<AddressDto> AddAddressAsync(Guid userId, CreateAddressDto dto);

    /// <summary>
    /// Met à jour une adresse existante d'un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur ou l'adresse n'existe pas</exception>
    /// <exception cref="ValidationException">Si les données sont invalides</exception>
    Task UpdateAddressAsync(Guid userId, Guid addressId, CreateAddressDto dto);

    /// <summary>
    /// Supprime une adresse d'un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur ou l'adresse n'existe pas</exception>
    Task DeleteAddressAsync(Guid userId, Guid addressId);

    /// <summary>
    /// Récupère tous les moyens de paiement d'un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur n'existe pas</exception>
    Task<List<PaymentMethodDto>> GetPaymentMethodsAsync(Guid userId);

    /// <summary>
    /// Ajoute un moyen de paiement à un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur n'existe pas</exception>
    /// <exception cref="ValidationException">Si les données sont invalides</exception>
    Task<PaymentMethodDto> AddPaymentMethodAsync(Guid userId, AddPaymentMethodDto dto);

    /// <summary>
    /// Définit un moyen de paiement comme défaut pour un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur ou le moyen de paiement n'existe pas</exception>
    Task SetDefaultPaymentMethodAsync(Guid userId, Guid paymentMethodId);

    /// <summary>
    /// Supprime un moyen de paiement d'un utilisateur.
    /// </summary>
    /// <exception cref="NotFoundException">Si l'utilisateur ou le moyen de paiement n'existe pas</exception>
    Task DeletePaymentMethodAsync(Guid userId, Guid paymentMethodId);
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

public class RefreshTokenDto
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class ForgotPasswordDto
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class CreateAddressDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class AddPaymentMethodDto
{
    public string StripePaymentMethodId { get; set; } = string.Empty;
    public string Provider { get; set; } = "stripe";
    public string CardBrand { get; set; } = string.Empty;
    public string Last4 { get; set; } = string.Empty;
    public int ExpMonth { get; set; }
    public int ExpYear { get; set; }
    public string Token { get; set; } = string.Empty;
}
