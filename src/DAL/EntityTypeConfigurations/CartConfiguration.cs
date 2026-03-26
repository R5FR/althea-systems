namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();

        builder.Property(c => c.SessionId).HasMaxLength(255);
        builder.Property(c => c.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.Property(c => c.UpdatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(c => c.User).WithMany().HasForeignKey("UserId").IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        builder.HasMany(c => c.Items).WithOne(ci => ci.Cart).HasForeignKey("CartId").OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex("UserId");
        builder.HasIndex(c => c.SessionId);

        builder.ToTable("Carts");
    }
}
