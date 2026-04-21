namespace Web.Controllers;

using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class TranslateController : ControllerBase
{
    private static readonly HashSet<string> _supported = new(StringComparer.OrdinalIgnoreCase) { "fr", "en", "ar" };

    private readonly ITranslationService _translation;

    public TranslateController(ITranslationService translation)
    {
        _translation = translation;
    }

    /// <summary>Translate a single text.</summary>
    [HttpPost]
    public async Task<IActionResult> Translate([FromBody] TranslateRequest dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Text)) return BadRequest("text is required");
        if (!_supported.Contains(dto.Source ?? "")) return BadRequest($"Unsupported source language. Supported: {string.Join(", ", _supported)}");
        if (!_supported.Contains(dto.Target ?? "")) return BadRequest($"Unsupported target language. Supported: {string.Join(", ", _supported)}");

        var translated = await _translation.TranslateAsync(dto.Text, dto.Source!, dto.Target!, ct);
        return Ok(new { translatedText = translated });
    }

    /// <summary>Translate multiple texts in one call.</summary>
    [HttpPost("batch")]
    public async Task<IActionResult> TranslateBatch([FromBody] TranslateBatchRequest dto, CancellationToken ct)
    {
        if (dto.Texts == null || !dto.Texts.Any()) return BadRequest("texts is required");
        if (!_supported.Contains(dto.Source ?? "")) return BadRequest($"Unsupported source language.");
        if (!_supported.Contains(dto.Target ?? "")) return BadRequest($"Unsupported target language.");

        var translated = await _translation.TranslateBatchAsync(dto.Texts, dto.Source!, dto.Target!, ct);
        return Ok(new { translatedTexts = translated });
    }
}

public record TranslateRequest(string Text, string Source, string Target);
public record TranslateBatchRequest(IEnumerable<string> Texts, string Source, string Target);
