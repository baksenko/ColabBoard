using ColabBoard.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataColabBoard.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasMany(x => x.Rooms)
            .WithMany(x => x.Users)
            .UsingEntity(j => j.ToTable("UserRooms"));
        
    }
}