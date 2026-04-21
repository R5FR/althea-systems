namespace Application.Services;

using Application.DTOs;

public interface IHomepageConfigService
{
    Task<HomepageConfigDto> GetAsync();
    Task SaveAsync(HomepageConfigDto config);
}
