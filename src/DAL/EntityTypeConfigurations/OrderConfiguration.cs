namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).ValueGeneratedNever();

        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
        builder.Property(o => o.TotalHt).IsRequired().HasPrecision(18, 2);
        builder.Property(o => o.TotalTva).IsRequired().HasPrecision(18, 2);
        builder.Property(o => o.TotalTtc).IsRequired().HasPrecision(18, 2);
        builder.Property(o => o.Status).IsRequired().HasConversion<string>();
        builder.Property(o => o.PaymentStatus).IsRequired().HasConversion<string>();
        builder.Property(o => o.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.Property(o => o.UpdatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(o => o.User).WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.BillingAddress).WithMany().HasForeignKey("BillingAddressId").OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.ShippingAddress).WithMany().HasForeignKey("ShippingAddressId").OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.PaymentMethod).WithMany().HasForeignKey("PaymentMethodId").IsRequired(false).OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Items).WithOne().HasForeignKey("OrderId").OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex("UserId");
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.PaymentStatus);
        builder.HasIndex(o => o.OrderNumber).IsUnique();

        builder.ToTable("Orders");
    }
}
