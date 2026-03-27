namespace Application.Mappers;

using Application.DTOs;
using AutoMapper;
using Project.Domain.Entities;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings - Public user info only
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.AccountStatus, opt => opt.MapFrom(src => src.AccountStatus.ToString()))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

        // Product mappings
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src =>
                src.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).ToList()))
            .ForMember(dest => dest.MainImageUrl, opt => opt.MapFrom(src =>
                src.Images.OrderBy(i => i.DisplayOrder).Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                ?? src.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).FirstOrDefault()));

        CreateMap<Product, ProductListItemDto>()
            .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src =>
                src.Images.OrderBy(i => i.DisplayOrder).Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                ?? src.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).FirstOrDefault()));
        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();

        // Cart mappings
        CreateMap<Cart, CartDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.User != null ? src.User.Id : (Guid?)null));
        CreateMap<CartItem, CartItemDto>()
            .ForMember(dest => dest.ProductId,   opt => opt.MapFrom(src => src.Product.Id))
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
            .ForMember(dest => dest.UnitPriceHt, opt => opt.MapFrom(src => src.Product.PriceHt))
            .ForMember(dest => dest.TvaRate,     opt => opt.MapFrom(src => src.Product.TvaRate))
            .ForMember(dest => dest.StockQuantity, opt => opt.MapFrom(src => src.Product.StockQuantity))
            .ForMember(dest => dest.IsAvailable, opt => opt.MapFrom(src => src.Product.StockQuantity > 0))
            .ForMember(dest => dest.ImageUrl,    opt => opt.MapFrom(src =>
                src.Product.Images.OrderBy(i => i.DisplayOrder).Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                ?? src.Product.Images.OrderBy(i => i.DisplayOrder).Select(i => i.ImageUrl).FirstOrDefault()));

        // Order mappings
        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => src.PaymentStatus.ToString()))
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.User != null ? src.User.Id : Guid.Empty))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items));
        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(dest => dest.ProductNameSnapshot, opt => opt.MapFrom(src => src.ProductNameSnapshot));

        // Address mappings
        CreateMap<Address, AddressDto>().ReverseMap();

        // PaymentMethod mappings
        CreateMap<PaymentMethod, PaymentMethodDto>().ReverseMap();

        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
    }
}
