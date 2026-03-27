using System;
using System.Linq;
using Project.Domain.Exceptions;
using Project.Domain.ValueObjects;

namespace Project.Domain.Entities
{
    public class User
    {
        public Guid Id { get; private set; }
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public EmailAddress Email { get; private set; }
        public string PasswordHash { get; private set; }
        public Enums.AccountStatus AccountStatus { get; private set; }
        public Enums.Role Role { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        public DateTime? LastLoginAt { get; private set; }
        public DateTime? EmailVerifiedAt { get; private set; }
        public string? PasswordResetToken { get; private set; }
        public DateTime? PasswordResetTokenExpiry { get; private set; }
        public string? EmailConfirmationToken { get; private set; }
        public DateTime? EmailConfirmationTokenExpiry { get; private set; }
        private readonly List<PaymentMethod> _paymentMethods = new();
        public IReadOnlyCollection<PaymentMethod> PaymentMethods => _paymentMethods.AsReadOnly();
        private readonly List<Address> _addresses = new();
        public IReadOnlyCollection<Address> Addresses => _addresses.AsReadOnly();

        private User() { } // For EF Core

        public User(Guid id, string firstName, string lastName, EmailAddress email, string passwordHash, Enums.Role role = Enums.Role.User)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(firstName)) throw new ValidationException("FirstName is required");
            if (string.IsNullOrWhiteSpace(lastName)) throw new ValidationException("LastName is required");
            if (email == null) throw new ValidationException("Email is required");
            if (string.IsNullOrWhiteSpace(passwordHash)) throw new ValidationException("PasswordHash is required");

            Id = id;
            FirstName = firstName.Trim();
            LastName = lastName.Trim();
            Email = email;
            PasswordHash = passwordHash;
            Role = role;
            AccountStatus = Enums.AccountStatus.Active;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void AddPaymentMethod(PaymentMethod pm)
        {
            if (pm == null) throw new ValidationException("PaymentMethod is required");
            _paymentMethods.Add(pm);
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemovePaymentMethod(Guid paymentMethodId)
        {
            var pm = _paymentMethods.FirstOrDefault(p => p.Id == paymentMethodId);
            if (pm == null) throw new NotFoundException($"Payment method with id '{paymentMethodId}' not found");
            _paymentMethods.Remove(pm);
            UpdatedAt = DateTime.UtcNow;
        }

        public void AddAddress(Address a)
        {
            if (a == null) throw new ValidationException("Address is required");
            _addresses.Add(a);
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemoveAddress(Guid addressId)
        {
            var address = _addresses.FirstOrDefault(a => a.Id == addressId);
            if (address == null) throw new NotFoundException($"Address with id '{addressId}' not found");
            _addresses.Remove(address);
            UpdatedAt = DateTime.UtcNow;
        }

        public void VerifyEmail(DateTime timestamp)
        {
            EmailVerifiedAt = timestamp;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateLastLogin(DateTime timestamp)
        {
            LastLoginAt = timestamp;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetPasswordHash(string hash)
        {
            if (string.IsNullOrWhiteSpace(hash)) throw new ValidationException("Password hash cannot be empty");
            PasswordHash = hash;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateName(string firstName, string lastName)
        {
            if (string.IsNullOrWhiteSpace(firstName)) throw new ValidationException("FirstName is required");
            if (string.IsNullOrWhiteSpace(lastName)) throw new ValidationException("LastName is required");
            FirstName = firstName.Trim();
            LastName = lastName.Trim();
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetPasswordResetToken(string token, DateTime expiry)
        {
            if (string.IsNullOrWhiteSpace(token)) throw new ValidationException("Password reset token cannot be empty");
            PasswordResetToken = token;
            PasswordResetTokenExpiry = expiry;
            UpdatedAt = DateTime.UtcNow;
        }

        public void ClearPasswordResetToken()
        {
            PasswordResetToken = null;
            PasswordResetTokenExpiry = null;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetEmailConfirmationToken(string token, DateTime expiry)
        {
            if (string.IsNullOrWhiteSpace(token)) throw new ValidationException("Email confirmation token cannot be empty");
            EmailConfirmationToken = token;
            EmailConfirmationTokenExpiry = expiry;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            AccountStatus = Enums.AccountStatus.Inactive;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Activate()
        {
            AccountStatus = Enums.AccountStatus.Active;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
