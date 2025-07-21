using ColabBoard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataColabBoard.Infrastructure.Data.Configurations;

public class RoomConfiguration: IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.HasKey(x => x.Id);


        builder.HasMany(x => x.Users)
            .WithMany(x => x.Rooms)
            .UsingEntity(j => j.ToTable("UserRooms"));

        builder.HasMany(x => x.Strokes)
            .WithOne(x => x.Room);
        
    }
}