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
            .WithMany(x => x.Strokes)
            .OnDelete(DeleteBehavior.Cascade); // Ensure strokes are deleted when room is deleted

        builder.Property(x => x.ElementId).IsRequired();
        builder.Property(x => x.ElementAttributes).HasColumnType("jsonb").IsRequired();
    }
}