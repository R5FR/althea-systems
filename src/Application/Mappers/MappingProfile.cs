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
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<Product, ProductListItemDto>();
        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();

        // Cart mappings
        CreateMap<Cart, CartDto>();
        CreateMap<CartItem, CartItemDto>();

        // Order mappings
        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => src.PaymentStatus.ToString()));
        CreateMap<OrderItem, OrderItemDto>();

        // Address mappings
        CreateMap<Address, AddressDto>().ReverseMap();

        // PaymentMethod mappings
        CreateMap<PaymentMethod, PaymentMethodDto>().ReverseMap();

        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
    }
}
