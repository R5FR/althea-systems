namespace Web.Services;

using System.Text.Json;
using Application.DTOs;
using Application.Services;

public class HomepageConfigService : IHomepageConfigService
{
    private readonly string _filePath;
    private static readonly JsonSerializerOptions _json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
    };

    public HomepageConfigService(IWebHostEnvironment env)
    {
        _filePath = Path.Combine(env.ContentRootPath, "homepage-config.json");
    }

    public async Task<HomepageConfigDto> GetAsync()
    {
        if (!File.Exists(_filePath)) return new HomepageConfigDto();
        var json = await File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<HomepageConfigDto>(json, _json) ?? new HomepageConfigDto();
    }

    public async Task SaveAsync(HomepageConfigDto config)
    {
        await File.WriteAllTextAsync(_filePath, JsonSerializer.Serialize(config, _json));
    }
}
