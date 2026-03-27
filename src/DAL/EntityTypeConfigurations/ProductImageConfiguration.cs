namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.HasKey(pi => pi.Id);
        builder.Property(pi => pi.Id).ValueGeneratedNever();

        builder.Property(pi => pi.ImageUrl).IsRequired().HasMaxLength(500);
        builder.Property(pi => pi.IsMain).IsRequired();
        builder.Property(pi => pi.DisplayOrder).IsRequired();
        builder.Property(pi => pi.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(pi => pi.Product).WithMany(p => p.Images).HasForeignKey("ProductId").OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex("ProductId");

        builder.ToTable("ProductImages");
    }
}
