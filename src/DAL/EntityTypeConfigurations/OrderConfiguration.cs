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

        builder.Property(o => o.UserId).IsRequired();

        builder.Property(o => o.TotalAmount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(o => o.PaymentStatus)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(o => o.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(o => o.UpdatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.PaymentStatus);

        builder.ToTable("Orders");
    }
}
