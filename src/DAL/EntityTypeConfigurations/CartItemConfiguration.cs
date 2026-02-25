namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.HasKey(ci => ci.Id);

        builder.Property(ci => ci.Id).ValueGeneratedNever();

        builder.Property(ci => ci.CartId).IsRequired();

        builder.Property(ci => ci.ProductId).IsRequired();

        builder.Property(ci => ci.Quantity)
            .IsRequired();

        builder.Property(ci => ci.UnitPrice)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.HasIndex(ci => ci.CartId);
        builder.HasIndex(ci => ci.ProductId);

        builder.ToTable("CartItems");
    }
}
