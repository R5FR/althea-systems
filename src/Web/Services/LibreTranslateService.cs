namespace Web.Services;

using Application.Interfaces;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

public class LibreTranslateService : ITranslationService
{
    private readonly HttpClient _http;
    private readonly ILogger<LibreTranslateService> _logger;

    public LibreTranslateService(HttpClient http, ILogger<LibreTranslateService> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<string> TranslateAsync(string text, string source, string target, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(text)) return text;
        if (string.Equals(source, target, StringComparison.OrdinalIgnoreCase)) return text;

        try
        {
            var response = await _http.PostAsJsonAsync("/translate", new
            {
                q = text,
                source,
                target,
                format = "text"
            }, cancellationToken);

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<LibreTranslateResponse>(cancellationToken: cancellationToken);
            return result?.TranslatedText ?? text;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "LibreTranslate failed for text (len={Len}), returning original", text.Length);
            return text;
        }
    }

    public async Task<List<string>> TranslateBatchAsync(IEnumerable<string> texts, string source, string target, CancellationToken cancellationToken = default)
    {
        var list = texts.ToList();
        var results = new List<string>(list.Count);

        foreach (var text in list)
            results.Add(await TranslateAsync(text, source, target, cancellationToken));

        return results;
    }

    private sealed class LibreTranslateResponse
    {
        [JsonPropertyName("translatedText")]
        public string TranslatedText { get; set; } = string.Empty;
    }
}
