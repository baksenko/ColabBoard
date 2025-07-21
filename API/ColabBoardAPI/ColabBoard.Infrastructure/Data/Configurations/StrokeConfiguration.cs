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

    }
}