namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();

        builder.Property(p => p.Name).IsRequired().HasMaxLength(255);
        builder.Property(p => p.Description).IsRequired().HasMaxLength(2000);
        builder.Property(p => p.PriceHt).IsRequired().HasPrecision(18, 2);
        builder.Property(p => p.TvaRate).IsRequired().HasPrecision(5, 2);
        builder.Property(p => p.PriceTtc).IsRequired().HasPrecision(18, 2);
        builder.Property(p => p.StockQuantity).IsRequired();
        builder.Property(p => p.Status).IsRequired().HasConversion<string>();
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(255);
        builder.Property(p => p.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.Property(p => p.UpdatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(p => p.Category).WithMany().HasForeignKey("CategoryId").OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.Slug).IsUnique();
        builder.HasIndex("CategoryId");
        builder.HasIndex(p => p.Status);

        builder.ToTable("Products");
    }
}
