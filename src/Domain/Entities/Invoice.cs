using System;
using Project.Domain.Exceptions;

namespace Project.Domain.Entities
{
    public class Invoice
    {
        public Guid Id { get; private set; }
        public string InvoiceNumber { get; private set; }
        public Order Order { get; private set; }
        public User User { get; private set; }
        public decimal TotalTtc { get; private set; }
        public Enums.InvoiceStatus Status { get; private set; }
        public DateTime IssuedAt { get; private set; }
        public string PdfUrl { get; private set; }

        private Invoice() { } // For EF Core

        public Invoice(Guid id, string invoiceNumber, Order order, User user, decimal totalTtc, string pdfUrl)
        {
            if (id == Guid.Empty) throw new ValidationException("Id cannot be empty");
            if (string.IsNullOrWhiteSpace(invoiceNumber)) throw new ValidationException("InvoiceNumber is required");
            Id = id;
            InvoiceNumber = invoiceNumber;
            Order = order ?? throw new ValidationException("Order is required");
            User = user ?? throw new ValidationException("User is required");
            TotalTtc = totalTtc;
            IssuedAt = DateTime.UtcNow;
            PdfUrl = pdfUrl ?? string.Empty;
            Status = Enums.InvoiceStatus.Pending;
        }
    }
}
