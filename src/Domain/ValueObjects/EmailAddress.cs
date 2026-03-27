using System;
using System.Text.RegularExpressions;
using Project.Domain.Exceptions;

namespace Project.Domain.ValueObjects
{
    public sealed class EmailAddress
    {
        public string Value { get; }

        private static readonly Regex _simpleEmail = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

        public EmailAddress(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) throw new ValidationException("Email is required");
            var v = email.Trim().ToLowerInvariant();
            if (!_simpleEmail.IsMatch(v)) throw new ValidationException("Email format is invalid");
            Value = v;
        }

        public override string ToString() => Value;
    }
}
