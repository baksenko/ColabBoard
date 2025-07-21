using Microsoft.EntityFrameworkCore;
using ColabBoard.Domain.Entities;
using DataColabBoard.Infrastructure.Data.Configurations;

namespace ColabBoard.Infrastructure.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    DbSet<User> Users { get; set; }
    DbSet<Room> Rooms { get; set; }
    DbSet<Stroke> Strokes { get; set; }
    
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new StrokeConfiguration());
        modelBuilder.ApplyConfiguration(new RoomConfiguration());
    }
}