namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.HasKey(cm => cm.Id);
        builder.Property(cm => cm.Id).ValueGeneratedNever();

        builder.Property(cm => cm.Email).IsRequired().HasMaxLength(255);
        builder.Property(cm => cm.Subject).IsRequired().HasMaxLength(255);
        builder.Property(cm => cm.Message).IsRequired().HasMaxLength(5000);
        builder.Property(cm => cm.Status).IsRequired().HasConversion<string>();
        builder.Property(cm => cm.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(cm => cm.User).WithMany().HasForeignKey("UserId").IsRequired(false).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(cm => cm.Email);
        builder.HasIndex(cm => cm.Status);

        builder.ToTable("ContactMessages");
    }
}
