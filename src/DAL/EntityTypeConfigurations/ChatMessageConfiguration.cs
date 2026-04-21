namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).ValueGeneratedNever();
        builder.Property(m => m.UserId).IsRequired();
        builder.Property(m => m.Role).IsRequired().HasMaxLength(20);
        builder.Property(m => m.Content).IsRequired();
        builder.Property(m => m.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne<User>().WithMany().HasForeignKey(m => m.UserId).OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => new { m.UserId, m.CreatedAt });

        builder.ToTable("ChatMessages");
    }
}
