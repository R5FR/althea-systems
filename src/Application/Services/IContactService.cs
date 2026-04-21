namespace Application.Services;

public class SubmitContactDto
{
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class ChatbotRequestDto
{
    public string Message { get; set; } = string.Empty;
}

public class ChatbotResponseDto
{
    public string Message { get; set; } = string.Empty;
}

public class ChatHistoryItemDto
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ContactMessageDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public interface IContactService
{
    Task SubmitAsync(SubmitContactDto dto);
    Task<ChatbotResponseDto> ChatAsync(ChatbotRequestDto dto, Guid userId, CancellationToken cancellationToken = default);
    Task<List<ChatHistoryItemDto>> GetChatHistoryAsync(Guid userId, int limit = 50);
    Task<List<ContactMessageDto>> GetAllAsync(bool unreadOnly = false);
    Task MarkAsReadAsync(Guid id);
    Task<int> GetUnreadCountAsync();
}
