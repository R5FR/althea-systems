using System;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class Address
    {
        public Guid Id { get; private set; }
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public string AddressLine1 { get; private set; }
        public string? AddressLine2 { get; private set; }
        public string City { get; private set; }
        public string Region { get; private set; }
        public string PostalCode { get; private set; }
        public string Country { get; private set; }
        public string Phone { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        private Address() { } // For EF Core

        public Address(Guid id, string firstName, string lastName, string addressLine1, string city, string region, string postalCode, string country, string phone, string? addressLine2 = null)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(firstName)) throw new ValidationException("FirstName is required");
            if (string.IsNullOrWhiteSpace(lastName)) throw new ValidationException("LastName is required");
            if (string.IsNullOrWhiteSpace(addressLine1)) throw new ValidationException("AddressLine1 is required");
            if (string.IsNullOrWhiteSpace(city)) throw new ValidationException("City is required");
            if (string.IsNullOrWhiteSpace(postalCode)) throw new ValidationException("PostalCode is required");
            if (string.IsNullOrWhiteSpace(country)) throw new ValidationException("Country is required");

            Id = id;
            FirstName = firstName.Trim();
            LastName = lastName.Trim();
            AddressLine1 = addressLine1.Trim();
            AddressLine2 = addressLine2?.Trim();
            City = city.Trim();
            Region = region?.Trim() ?? string.Empty;
            PostalCode = postalCode.Trim();
            Country = country.Trim();
            Phone = phone?.Trim() ?? string.Empty;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void Update(string firstName, string lastName, string addressLine1, string city, string region, string postalCode, string country, string phone, string? addressLine2 = null)
        {
            if (string.IsNullOrWhiteSpace(firstName)) throw new ValidationException("FirstName is required");
            if (string.IsNullOrWhiteSpace(lastName)) throw new ValidationException("LastName is required");
            FirstName = firstName.Trim();
            LastName = lastName.Trim();
            AddressLine1 = addressLine1.Trim();
            AddressLine2 = addressLine2?.Trim();
            City = city.Trim();
            Region = region?.Trim() ?? string.Empty;
            PostalCode = postalCode.Trim();
            Country = country.Trim();
            Phone = phone?.Trim() ?? string.Empty;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
