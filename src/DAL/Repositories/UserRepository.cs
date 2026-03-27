namespace DAL.Repositories;

using Application.Interfaces;
using Project.Domain.Entities;
using Project.Domain.Exceptions;
using Project.Domain.ValueObjects;
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
        return await _context.Users
            .Include(u => u.Addresses)
            .Include(u => u.PaymentMethods)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ValidationException("Email cannot be null or empty");

        var emailAddress = new EmailAddress(email);
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == emailAddress);
    }

    public async Task<User?> GetByPasswordResetTokenAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        return await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == token);
    }

    public async Task<User?> GetByEmailConfirmationTokenAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return null;

        return await _context.Users.FirstOrDefaultAsync(u => u.EmailConfirmationToken == token);
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

    public Task UpdateAsync(User user)
    {
        if (user == null)
            throw new ValidationException("User cannot be null");

        _context.Users.Update(user);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException($"User with ID '{id}' not found");

        _context.Users.Remove(user);
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var emailAddress = new EmailAddress(email);
        return await _context.Users.AnyAsync(u => u.Email == emailAddress);
    }

    public async Task<List<User>> GetAllAsync(int skip = 0, int take = 100, string? search = null)
    {
        if (skip < 0) skip = 0;
        if (take < 1) take = 100;

        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            // Email search is done in-memory after DB query to avoid value converter issues
            var results = await query
                .Where(u => u.FirstName.ToLower().Contains(term) || u.LastName.ToLower().Contains(term))
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            var emailResults = await _context.Users
                .Where(u => !u.FirstName.ToLower().Contains(term) && !u.LastName.ToLower().Contains(term))
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            emailResults = emailResults.Where(u => u.Email.Value.ToLower().Contains(term)).ToList();

            return results.Concat(emailResults)
                .DistinctBy(u => u.Id)
                .OrderByDescending(u => u.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToList();
        }

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<int> CountAsync(string? search = null)
    {
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            var all = await _context.Users.ToListAsync();
            return all.Count(u =>
                u.FirstName.ToLower().Contains(term) ||
                u.LastName.ToLower().Contains(term) ||
                u.Email.Value.ToLower().Contains(term));
        }

        return await _context.Users.CountAsync();
    }
}
