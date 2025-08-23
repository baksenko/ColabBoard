using Microsoft.EntityFrameworkCore;
using ColabBoard.Domain.Entities;
using DataColabBoard.Infrastructure.Data.Configurations;

namespace ColabBoard.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Stroke> Strokes { get; set; }
    
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new StrokeConfiguration());
        modelBuilder.ApplyConfiguration(new RoomConfiguration());
    }
}