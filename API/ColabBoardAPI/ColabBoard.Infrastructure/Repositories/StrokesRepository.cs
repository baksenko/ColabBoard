using ColabBoard.Application.Interfaces;
using ColabBoard.Domain.Entities;
using ColabBoard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ColabBoard.Infrastructure.Repositories;

public class StrokesRepository(AppDbContext context) : IStrokesRepository
{
    public async Task CreateStrokeAsync(Stroke stroke)
    {
        await context.Set<Stroke>()
            .AddAsync(stroke);

        await context.SaveChangesAsync();
    }
    
    public async Task DeleteStrokesAsync(Guid roomId, decimal x, decimal y)
    {
        var strokes = await context.Set<Stroke>()
            .Where(stroke => stroke.Room.Id == roomId)
            .ToListAsync();

        foreach (var stroke in strokes)
        {
            stroke.Cords.RemoveAll(point => Math.Abs(point.x - x) < 25 && Math.Abs(point.y - y) < 25);
        }

        await context.SaveChangesAsync();
    }
}