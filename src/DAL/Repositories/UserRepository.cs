namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using DAL.Context;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ValidationException("Email cannot be null or empty");

        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task AddAsync(User user)
    {
        if (user == null)
            throw new ValidationException("User cannot be null");

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        if (existingUser != null)
            throw new ConflictException($"User with email '{user.Email}' already exists");

        await _context.Users.AddAsync(user);
    }

    public void Update(User user)
    {
        if (user == null)
            throw new ValidationException("User cannot be null");

        _context.Users.Update(user);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException($"User with ID '{id}' not found");

        _context.Users.Remove(user);
    }

    public async Task<List<User>> GetAllAsync(int skip = 0, int take = 100)
    {
        if (skip < 0) skip = 0;
        if (take < 1) take = 100;

        return await _context.Users
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountAsync()
    {
        return await _context.Users.CountAsync();
    }
}
