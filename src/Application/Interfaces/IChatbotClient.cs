namespace Application.Interfaces;

public record ChatHistoryEntry(string Role, string Content);

public interface IChatbotClient
{
    Task<string> GenerateReplyAsync(
        string systemPrompt,
        IReadOnlyList<ChatHistoryEntry> history,
        string userMessage,
        CancellationToken cancellationToken = default);
}
