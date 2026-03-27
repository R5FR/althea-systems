using System;
using System.Collections.Generic;

namespace Project.Domain.Exceptions
{
    public class ValidationException : DomainException
    {
        public IReadOnlyList<string> Errors { get; }

        public ValidationException(string message) : base(message)
        {
            Errors = new List<string> { message };
        }

        public ValidationException(IEnumerable<string> errors) : base("Validation failed")
        {
            Errors = new List<string>(errors);
        }
    }
}
