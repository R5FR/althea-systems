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

        builder.Property(pm => pm.UserId).IsRequired();

        builder.Property(pm => pm.CardType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(pm => pm.Last4)
            .IsRequired()
            .HasMaxLength(4);

        builder.Property(pm => pm.ExpiryMonth).IsRequired();

        builder.Property(pm => pm.ExpiryYear).IsRequired();

        builder.Property(pm => pm.StripePaymentMethodId)
            .HasMaxLength(255);

        builder.HasIndex(pm => pm.UserId);

        builder.ToTable("PaymentMethods");
    }
}
