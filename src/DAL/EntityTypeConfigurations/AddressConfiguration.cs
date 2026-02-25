namespace DAL.EntityTypeConfigurations;

using Project.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id).ValueGeneratedNever();

        builder.Property(a => a.UserId).IsRequired();

        builder.Property(a => a.Street)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.City)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.State)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.PostalCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(a => a.Country)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(a => a.UserId);

        builder.ToTable("Addresses");
    }
}
