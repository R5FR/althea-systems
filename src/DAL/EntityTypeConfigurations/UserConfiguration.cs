namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Project.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).ValueGeneratedNever();

        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.LastName).IsRequired().HasMaxLength(100);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255)
            .HasConversion(v => v.Value, v => new EmailAddress(v));

        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(512);

        builder.Property(u => u.AccountStatus).IsRequired().HasConversion<string>();
        builder.Property(u => u.Role).IsRequired().HasConversion<string>();

        builder.Property(u => u.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.Property(u => u.UpdatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.Property(u => u.LastLoginAt);
        builder.Property(u => u.EmailVerifiedAt);
        builder.Property(u => u.PasswordResetToken).HasMaxLength(512);
        builder.Property(u => u.PasswordResetTokenExpiry);
        builder.Property(u => u.EmailConfirmationToken).HasMaxLength(512);
        builder.Property(u => u.EmailConfirmationTokenExpiry);
        builder.Property(u => u.StripeCustomerId).HasMaxLength(255);

        builder.HasIndex(u => u.Email).IsUnique();

        // Owned collections — configured via shadow FK in Address/PaymentMethod configs
        builder.HasMany(u => u.Addresses).WithOne().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(u => u.PaymentMethods).WithOne().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade);

        builder.ToTable("Users");
    }
}
