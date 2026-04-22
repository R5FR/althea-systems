namespace Web.Services;

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Application.Interfaces;

public class OllamaChatbotClient : IChatbotClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OllamaChatbotClient> _logger;
    private readonly string _model;

    public OllamaChatbotClient(HttpClient httpClient, IConfiguration configuration, ILogger<OllamaChatbotClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _model = configuration["Chatbot:Model"] ?? "mistral";
    }

    public async Task<string> GenerateReplyAsync(
        string systemPrompt,
        IReadOnlyList<ChatHistoryEntry> history,
        string userMessage,
        CancellationToken cancellationToken = default)
    {
        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        foreach (var entry in history)
            messages.Add(new { role = entry.Role, content = entry.Content });

        messages.Add(new { role = "user", content = userMessage });

        var payload = new
        {
            model = _model,
            stream = false,
            keep_alive = "30m",
            messages = messages.ToArray(),
            options = new { temperature = 0.2, top_p = 0.9, num_predict = 250, num_ctx = 2560 }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/chat")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Ollama error status {StatusCode}: {Content}", response.StatusCode, content);
            throw new InvalidOperationException("Le service IA est indisponible.");
        }

        using var doc = JsonDocument.Parse(content);
        if (!doc.RootElement.TryGetProperty("message", out var messageNode) ||
            !messageNode.TryGetProperty("content", out var contentNode))
        {
            throw new InvalidOperationException("Réponse IA invalide.");
        }

        var text = contentNode.GetString()?.Trim();
        if (string.IsNullOrWhiteSpace(text))
            throw new InvalidOperationException("Réponse IA vide.");

        return text;
    }
}
