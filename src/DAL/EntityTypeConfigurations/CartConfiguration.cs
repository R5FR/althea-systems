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

        builder.Property(c => c.UserId);

        builder.Property(c => c.SessionId)
            .HasMaxLength(255);

        builder.Property(c => c.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(c => c.UpdatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasMany(c => c.Items)
            .WithOne()
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => c.UserId);
        builder.HasIndex(c => c.SessionId);

        builder.ToTable("Carts");
    }
}
