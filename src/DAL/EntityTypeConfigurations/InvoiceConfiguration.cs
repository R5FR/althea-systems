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

        builder.Property(i => i.InvoiceNumber).IsRequired().HasMaxLength(50);
        builder.Property(i => i.TotalTtc).IsRequired().HasPrecision(18, 2);
        builder.Property(i => i.Status).IsRequired().HasConversion<string>();
        builder.Property(i => i.IssuedAt).IsRequired();
        builder.Property(i => i.PdfUrl).IsRequired().HasMaxLength(500);

        builder.HasOne(i => i.Order).WithMany().HasForeignKey("OrderId").OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(i => i.User).WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex("OrderId").IsUnique();
        builder.HasIndex("UserId");
        builder.HasIndex(i => i.Status);

        builder.ToTable("Invoices");
    }
}
