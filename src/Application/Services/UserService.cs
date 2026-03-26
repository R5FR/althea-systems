namespace Application.Services;

using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Project.Domain.Services;
using Project.Domain.ValueObjects;
using System.Collections.Generic;

/// <summary>
/// Implémentation concrète du service de gestion des utilisateurs.
/// </summary>
public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IMapper mapper,
        ITokenGenerator tokenGenerator,
        IRefreshTokenService refreshTokenService,
        ILogger<UserService> logger)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _tokenGenerator = tokenGenerator ?? throw new ArgumentNullException(nameof(tokenGenerator));
        _refreshTokenService = refreshTokenService ?? throw new ArgumentNullException(nameof(refreshTokenService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterUserDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Email)) throw new ValidationException("Email is required");
        if (string.IsNullOrWhiteSpace(dto.Password)) throw new ValidationException("Password is required");
        if (string.IsNullOrWhiteSpace(dto.FirstName)) throw new ValidationException("FirstName is required");
        if (string.IsNullOrWhiteSpace(dto.LastName)) throw new ValidationException("LastName is required");

        // Vérifier que l'email n'existe pas déjà
        var existingUser = await _unitOfWork.UserRepository.GetByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            throw new ConflictException($"User with email '{dto.Email}' already exists");
        }

        // Créer la nouvelle entité User
        var emailAddress = new EmailAddress(dto.Email);
        var passwordHash = _passwordHasher.Hash(dto.Password);

        var newUser = new User(
            Guid.NewGuid(),
            dto.FirstName,
            dto.LastName,
            emailAddress,
            passwordHash,
            Project.Domain.Enums.Role.User);

        await _unitOfWork.UserRepository.AddAsync(newUser);
        await _unitOfWork.SaveChangesAsync();

        // Générer les tokens
        var tokenResult = await _tokenGenerator.GenerateTokenAsync(newUser.Id, newUser.Email.Value, newUser.Role.ToString());
        _refreshTokenService.Store(newUser.Id, tokenResult.RefreshToken, DateTime.UtcNow.AddDays(7));

        // Mapper l'utilisateur en DTO
        var userDto = _mapper.Map<UserDto>(newUser);

        return new AuthResultDto
        {
            AccessToken = tokenResult.AccessToken,
            ExpiresIn = tokenResult.ExpiresIn,
            RefreshToken = tokenResult.RefreshToken,
            User = userDto
        };
    }

    public async Task<AuthResultDto> LoginAsync(LoginDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Email)) throw new ValidationException("Email is required");
        if (string.IsNullOrWhiteSpace(dto.Password)) throw new ValidationException("Password is required");

        // Récupérer l'utilisateur par email
        var user = await _unitOfWork.UserRepository.GetByEmailAsync(dto.Email);
        if (user == null)
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Vérifier le mot de passe
        if (!_passwordHasher.Verify(user.PasswordHash, dto.Password))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Mettre à jour la date de dernière connexion
        user.UpdateLastLogin(DateTime.UtcNow);
        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Générer les tokens
        var tokenResult = await _tokenGenerator.GenerateTokenAsync(user.Id, user.Email.Value, user.Role.ToString());
        _refreshTokenService.Store(user.Id, tokenResult.RefreshToken, DateTime.UtcNow.AddDays(7));

        // Mapper l'utilisateur en DTO
        var userDto = _mapper.Map<UserDto>(user);

        return new AuthResultDto
        {
            AccessToken = tokenResult.AccessToken,
            ExpiresIn = tokenResult.ExpiresIn,
            RefreshToken = tokenResult.RefreshToken,
            User = userDto
        };
    }

    public async Task<UserDto> GetProfileAsync(Guid userId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task UpdateProfileAsync(Guid userId, UpdateUserDto dto)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (dto == null) throw new ArgumentNullException(nameof(dto));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        if (!string.IsNullOrWhiteSpace(dto.FirstName) || !string.IsNullOrWhiteSpace(dto.LastName))
        {
            var firstName = string.IsNullOrWhiteSpace(dto.FirstName) ? user.FirstName : dto.FirstName;
            var lastName = string.IsNullOrWhiteSpace(dto.LastName) ? user.LastName : dto.LastName;
            user.UpdateName(firstName, lastName);
        }

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ConfirmEmailAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) throw new ArgumentException("Token is required", nameof(token));

        var user = await _unitOfWork.UserRepository.GetByEmailConfirmationTokenAsync(token);
        if (user == null)
        {
            throw new NotFoundException("Email confirmation token is invalid");
        }

        if (user.EmailConfirmationTokenExpiry.HasValue && user.EmailConfirmationTokenExpiry.Value < DateTime.UtcNow)
        {
            throw new ValidationException("Email confirmation token has expired");
        }

        user.VerifyEmail(DateTime.UtcNow);

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<AuthResultDto> RefreshTokenAsync(RefreshTokenDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.RefreshToken)) throw new ValidationException("RefreshToken is required");

        var userId = _refreshTokenService.Validate(dto.RefreshToken);
        if (userId == null)
            throw new UnauthorizedException("Invalid or expired refresh token");

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId.Value);
        if (user == null)
            throw new UnauthorizedException("User not found");

        // Révoquer l'ancien token et en émettre un nouveau
        _refreshTokenService.Revoke(dto.RefreshToken);
        var tokenResult = await _tokenGenerator.GenerateTokenAsync(user.Id, user.Email.Value, user.Role.ToString());
        _refreshTokenService.Store(user.Id, tokenResult.RefreshToken, DateTime.UtcNow.AddDays(7));

        var userDto = _mapper.Map<UserDto>(user);
        return new AuthResultDto
        {
            AccessToken = tokenResult.AccessToken,
            ExpiresIn = tokenResult.ExpiresIn,
            RefreshToken = tokenResult.RefreshToken,
            User = userDto
        };
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Email)) throw new ValidationException("Email is required");

        var user = await _unitOfWork.UserRepository.GetByEmailAsync(dto.Email);
        if (user == null)
        {
            throw new NotFoundException($"User with email '{dto.Email}' not found");
        }

        var token = Guid.NewGuid().ToString();
        var expiry = DateTime.UtcNow.AddHours(24);
        user.SetPasswordResetToken(token, expiry);

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Password reset token for {Email}: {Token}", dto.Email, token);
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Token)) throw new ValidationException("Token is required");
        if (string.IsNullOrWhiteSpace(dto.NewPassword)) throw new ValidationException("NewPassword is required");

        var user = await _unitOfWork.UserRepository.GetByPasswordResetTokenAsync(dto.Token);
        if (user == null)
        {
            throw new NotFoundException("Password reset token is invalid");
        }

        if (user.PasswordResetTokenExpiry.HasValue && user.PasswordResetTokenExpiry.Value < DateTime.UtcNow)
        {
            throw new ValidationException("Password reset token has expired");
        }

        var newHash = _passwordHasher.Hash(dto.NewPassword);
        user.SetPasswordHash(newHash);
        user.ClearPasswordResetToken();

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<AddressDto>> GetAddressesAsync(Guid userId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        return _mapper.Map<List<AddressDto>>(user.Addresses);
    }

    public async Task<AddressDto> AddAddressAsync(Guid userId, CreateAddressDto dto)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.AddressLine1)) throw new ValidationException("AddressLine1 is required");
        if (string.IsNullOrWhiteSpace(dto.City)) throw new ValidationException("City is required");
        if (string.IsNullOrWhiteSpace(dto.PostalCode)) throw new ValidationException("PostalCode is required");
        if (string.IsNullOrWhiteSpace(dto.Country)) throw new ValidationException("Country is required");

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        var address = new Address(
            Guid.NewGuid(),
            dto.FirstName,
            dto.LastName,
            dto.AddressLine1,
            dto.City,
            dto.Region,
            dto.PostalCode,
            dto.Country,
            dto.Phone,
            dto.AddressLine2);

        user.AddAddress(address);

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<AddressDto>(address);
    }

    public async Task UpdateAddressAsync(Guid userId, Guid addressId, CreateAddressDto dto)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (addressId == Guid.Empty) throw new ArgumentException("AddressId cannot be empty", nameof(addressId));
        if (dto == null) throw new ArgumentNullException(nameof(dto));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        var address = user.Addresses.FirstOrDefault(a => a.Id == addressId);
        if (address == null)
        {
            throw new NotFoundException($"Address with id '{addressId}' not found for user '{userId}'");
        }

        address.Update(
            dto.FirstName,
            dto.LastName,
            dto.AddressLine1,
            dto.City,
            dto.Region,
            dto.PostalCode,
            dto.Country,
            dto.Phone,
            dto.AddressLine2);

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeleteAddressAsync(Guid userId, Guid addressId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (addressId == Guid.Empty) throw new ArgumentException("AddressId cannot be empty", nameof(addressId));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        user.RemoveAddress(addressId);

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<PaymentMethodDto>> GetPaymentMethodsAsync(Guid userId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        return _mapper.Map<List<PaymentMethodDto>>(user.PaymentMethods);
    }

    public async Task<PaymentMethodDto> AddPaymentMethodAsync(Guid userId, AddPaymentMethodDto dto)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (string.IsNullOrWhiteSpace(dto.Provider)) throw new ValidationException("Provider is required");
        if (string.IsNullOrWhiteSpace(dto.Last4) || dto.Last4.Length != 4) throw new ValidationException("Last4 must be 4 digits");

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        var isFirstPaymentMethod = user.PaymentMethods.Count == 0;

        var paymentMethod = new PaymentMethod(
            Guid.NewGuid(),
            dto.Provider,
            dto.CardBrand,
            dto.Last4,
            dto.ExpMonth,
            dto.ExpYear,
            dto.Token,
            isFirstPaymentMethod);

        user.AddPaymentMethod(paymentMethod);

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<PaymentMethodDto>(paymentMethod);
    }

    public async Task SetDefaultPaymentMethodAsync(Guid userId, Guid paymentMethodId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (paymentMethodId == Guid.Empty) throw new ArgumentException("PaymentMethodId cannot be empty", nameof(paymentMethodId));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        var target = user.PaymentMethods.FirstOrDefault(pm => pm.Id == paymentMethodId);
        if (target == null)
        {
            throw new NotFoundException($"Payment method with id '{paymentMethodId}' not found for user '{userId}'");
        }

        foreach (var pm in user.PaymentMethods)
        {
            pm.SetDefault(pm.Id == paymentMethodId);
        }

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeletePaymentMethodAsync(Guid userId, Guid paymentMethodId)
    {
        if (userId == Guid.Empty) throw new ArgumentException("UserId cannot be empty", nameof(userId));
        if (paymentMethodId == Guid.Empty) throw new ArgumentException("PaymentMethodId cannot be empty", nameof(paymentMethodId));

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException($"User with id '{userId}' not found");
        }

        user.RemovePaymentMethod(paymentMethodId);

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }
}
