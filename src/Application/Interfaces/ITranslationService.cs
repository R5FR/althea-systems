namespace Application.Interfaces;

public interface ITranslationService
{
    Task<string> TranslateAsync(string text, string source, string target, CancellationToken cancellationToken = default);
    Task<List<string>> TranslateBatchAsync(IEnumerable<string> texts, string source, string target, CancellationToken cancellationToken = default);
}
