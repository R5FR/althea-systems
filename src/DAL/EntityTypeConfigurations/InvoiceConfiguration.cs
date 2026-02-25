namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id).ValueGeneratedNever();

        builder.Property(i => i.OrderId).IsRequired();

        builder.Property(i => i.UserId).IsRequired();

        builder.Property(i => i.Amount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(i => i.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(i => i.IssuedAt).IsRequired();

        builder.Property(i => i.PaidAt);

        builder.Property(i => i.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(i => i.OrderId).IsUnique();
        builder.HasIndex(i => i.UserId);
        builder.HasIndex(i => i.Status);

        builder.ToTable("Invoices");
    }
}
