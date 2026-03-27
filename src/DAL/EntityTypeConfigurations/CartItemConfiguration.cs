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

        builder.Property<Guid>("CartId").IsRequired();
        builder.Property(ci => ci.Quantity).IsRequired();
        builder.Property(ci => ci.UnitPriceTtc).IsRequired().HasPrecision(18, 2);
        builder.Property(ci => ci.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.Property(ci => ci.UpdatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(ci => ci.Product).WithMany().HasForeignKey("ProductId").OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex("CartId");
        builder.HasIndex("ProductId");

        builder.ToTable("CartItems");
    }
}
