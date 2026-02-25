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

        builder.Property(oi => oi.OrderId).IsRequired();

        builder.Property(oi => oi.ProductId).IsRequired();

        builder.Property(oi => oi.Quantity).IsRequired();

        builder.Property(oi => oi.UnitPrice)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.HasIndex(oi => oi.OrderId);
        builder.HasIndex(oi => oi.ProductId);

        builder.ToTable("OrderItems");
    }
}
