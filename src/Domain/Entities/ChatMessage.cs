namespace Project.Domain.Entities
{
    public class ChatMessage
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string Role { get; private set; } = string.Empty; // "user" | "assistant"
        public string Content { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }

        private ChatMessage() { } // For EF Core

        public ChatMessage(Guid id, Guid userId, string role, string content)
        {
            Id = id;
            UserId = userId;
            Role = role;
            Content = content;
            CreatedAt = DateTime.UtcNow;
        }
    }
}
