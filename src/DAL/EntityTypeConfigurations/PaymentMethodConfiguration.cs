namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PaymentMethodConfiguration : IEntityTypeConfiguration<PaymentMethod>
{
    public void Configure(EntityTypeBuilder<PaymentMethod> builder)
    {
        builder.HasKey(pm => pm.Id);
        builder.Property(pm => pm.Id).ValueGeneratedNever();

        builder.Property<Guid>("UserId").IsRequired();

        builder.Property(pm => pm.Provider).IsRequired().HasMaxLength(50);
        builder.Property(pm => pm.CardBrand).IsRequired().HasMaxLength(50);
        builder.Property(pm => pm.Last4).IsRequired().HasMaxLength(4);
        builder.Property(pm => pm.ExpMonth).IsRequired();
        builder.Property(pm => pm.ExpYear).IsRequired();
        builder.Property(pm => pm.Token).HasMaxLength(500);
        builder.Property(pm => pm.IsDefault).IsRequired();
        builder.Property(pm => pm.CreatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");
        builder.Property(pm => pm.UpdatedAt).IsRequired().HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex("UserId");

        builder.ToTable("PaymentMethods");
    }
}
