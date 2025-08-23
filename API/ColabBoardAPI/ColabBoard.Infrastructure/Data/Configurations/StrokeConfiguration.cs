using ColabBoard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataColabBoard.Infrastructure.Data.Configurations;

public class StrokeConfiguration : IEntityTypeConfiguration<Stroke>
{
    public void Configure(EntityTypeBuilder<Stroke> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Room)
            .WithMany(x => x.Strokes);

        builder.OwnsMany(s => s.Cords, a =>
        {
            a.WithOwner().HasForeignKey("StrokeId");
            a.Property<int>("Id");
            a.HasKey("Id");
            a.Property(p => p.Order).IsRequired();
            a.HasIndex("StrokeId", nameof(Point.Order));
            a.ToTable("StrokePoints");
        });
    }
}