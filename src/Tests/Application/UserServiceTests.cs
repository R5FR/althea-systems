using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Project.Domain.Entities;
using Project.Domain.Enums;
using Project.Domain.Exceptions;
using Project.Domain.Services;
using Project.Domain.ValueObjects;

namespace Tests.Application;

public class UserServiceTests
{
    private readonly Mock<IUnitOfWork> _uow = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<IMapper> _mapper = new();
    private readonly Mock<ITokenGenerator> _tokenGen = new();
    private readonly Mock<ILogger<UserService>> _logger = new();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _uow.Setup(u => u.UserRepository).Returns(_userRepo.Object);
        _sut = new UserService(_uow.Object, _hasher.Object, _mapper.Object, _tokenGen.Object, _logger.Object);
    }

    private static User MakeUser(string email = "jean@test.fr", Role role = Role.User) =>
        new(Guid.NewGuid(), "Jean", "Dupont", new EmailAddress(email), "hash", role);

    private void SetupTokenGen() =>
        _tokenGen.Setup(t => t.GenerateTokenAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>()))
                 .ReturnsAsync(new TokenResult { AccessToken = "access", RefreshToken = "refresh", ExpiresIn = 3600 });

    // ── RegisterAsync ────────────────────────────────────────────────────────

    [Fact]
    public async Task RegisterAsync_NullDto_ThrowsArgumentNullException()
    {
        Func<Task> act = () => _sut.RegisterAsync(null!);
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task RegisterAsync_EmptyEmail_ThrowsValidationException()
    {
        var dto = new RegisterUserDto { Email = "", Password = "pass", FirstName = "A", LastName = "B" };
        Func<Task> act = () => _sut.RegisterAsync(dto);
        await act.Should().ThrowAsync<ValidationException>();
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsConflictException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("jean@test.fr")).ReturnsAsync(MakeUser());
        var dto = new RegisterUserDto { Email = "jean@test.fr", Password = "pass", FirstName = "A", LastName = "B" };
        Func<Task> act = () => _sut.RegisterAsync(dto);
        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task RegisterAsync_ValidDto_CallsAddAndSave()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("hashed");
        SetupTokenGen();
        _mapper.Setup(m => m.Map<UserDto>(It.IsAny<User>())).Returns(new UserDto());

        var dto = new RegisterUserDto { Email = "nouveau@test.fr", Password = "Pass123!", FirstName = "Nouveau", LastName = "User" };
        await _sut.RegisterAsync(dto);

        _userRepo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        _uow.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    // ── LoginAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task LoginAsync_NullDto_ThrowsArgumentNullException()
    {
        Func<Task> act = () => _sut.LoginAsync(null!);
        await act.Should().ThrowAsync<ArgumentNullException>();
    }

    [Fact]
    public async Task LoginAsync_UnknownEmail_ThrowsUnauthorizedException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        Func<Task> act = () => _sut.LoginAsync(new LoginDto { Email = "inconnu@test.fr", Password = "pass" });
        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync(MakeUser());
        _hasher.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(false);
        Func<Task> act = () => _sut.LoginAsync(new LoginDto { Email = "jean@test.fr", Password = "wrong" });
        await act.Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokens()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync(MakeUser());
        _hasher.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(true);
        SetupTokenGen();
        _mapper.Setup(m => m.Map<UserDto>(It.IsAny<User>())).Returns(new UserDto());

        var result = await _sut.LoginAsync(new LoginDto { Email = "jean@test.fr", Password = "correct" });

        result.AccessToken.Should().Be("access");
        result.RefreshToken.Should().Be("refresh");
    }

    [Fact]
    public async Task LoginAsync_UpdatesLastLoginOnSuccess()
    {
        var user = MakeUser();
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        _hasher.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns(true);
        SetupTokenGen();
        _mapper.Setup(m => m.Map<UserDto>(It.IsAny<User>())).Returns(new UserDto());

        await _sut.LoginAsync(new LoginDto { Email = "jean@test.fr", Password = "correct" });

        _userRepo.Verify(r => r.UpdateAsync(It.IsAny<User>()), Times.Once);
        user.LastLoginAt.Should().NotBeNull();
    }
}
