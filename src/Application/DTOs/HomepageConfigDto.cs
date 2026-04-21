namespace Application.DTOs;

public class CarouselSlideDto
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? CtaLink { get; set; }
    public string? CtaText { get; set; }
}

public class HomepageConfigDto
{
    public List<CarouselSlideDto> CarouselSlides { get; set; } = new();
    public string? FeaturedTitle { get; set; }
    public string? FeaturedText { get; set; }
    public List<string> FeaturedProductIds { get; set; } = new();
    public List<string> FeaturedCategoryIds { get; set; } = new();
}
