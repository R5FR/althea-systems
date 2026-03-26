namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.Id).ValueGeneratedNever();

        builder.Property(oi => oi.ProductNameSnapshot).IsRequired().HasMaxLength(255);
        builder.Property(oi => oi.UnitPriceHt).IsRequired().HasPrecision(18, 2);
        builder.Property(oi => oi.UnitTvaRate).IsRequired().HasPrecision(5, 2);
        builder.Property(oi => oi.UnitPriceTtc).IsRequired().HasPrecision(18, 2);
        builder.Property(oi => oi.Quantity).IsRequired();
        builder.Property(oi => oi.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(oi => oi.Product).WithMany().HasForeignKey("ProductId").OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex("OrderId");
        builder.HasIndex("ProductId");

        builder.ToTable("OrderItems");
    }
}
