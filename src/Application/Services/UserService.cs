namespace Application.Services;

using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Project.Domain.Services;
using Project.Domain.ValueObjects;

/// <summary>
/// Implémentation concrète du service de gestion des utilisateurs.
/// </summary>
public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;
    private readonly ITokenGenerator _tokenGenerator;

    public UserService(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IMapper mapper,
        ITokenGenerator tokenGenerator)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _passwordHasher = passwordHasher ?? throw new ArgumentNullException(nameof(passwordHasher));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _tokenGenerator = tokenGenerator ?? throw new ArgumentNullException(nameof(tokenGenerator));
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
        if (!_passwordHasher.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Mettre à jour la date de dernière connexion
        user.UpdateLastLogin(DateTime.UtcNow);
        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // Générer les tokens
        var tokenResult = await _tokenGenerator.GenerateTokenAsync(user.Id, user.Email.Value, user.Role.ToString());

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

        // Mettre à jour les propriétés (si les User properties étaient mutables)
        // À adapter selon l'implémentation réelle de l'entité User
        // Pour l'instant, les propriétés User étant en private set, on doit ajouter des setters ou des méthodes

        await _unitOfWork.UserRepository.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ConfirmEmailAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token)) throw new ArgumentException("Token is required", nameof(token));

        // À implémenter selon le système de tokens email
        // Pour l'instant, placeholder pour éviter erreur
        throw new NotImplementedException("Email confirmation not yet implemented");
    }
}
