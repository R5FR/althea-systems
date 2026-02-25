using System;
using Project.Domain.Enums;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class ContactMessage
    {
        public Guid Id { get; private set; }
        public User? User { get; private set; }
        public string Email { get; private set; }
        public string Subject { get; private set; }
        public string Message { get; private set; }
        public Enums.MessageStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public ContactMessage(Guid id, string email, string subject, string message, User? user = null)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(email)) throw new ValidationException("Email is required");
            if (string.IsNullOrWhiteSpace(subject)) throw new ValidationException("Subject is required");
            Id = id;
            User = user;
            Email = email.Trim();
            Subject = subject.Trim();
            Message = message?.Trim() ?? string.Empty;
            Status = Enums.MessageStatus.New;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
