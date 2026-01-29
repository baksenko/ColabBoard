using ColabBoard.Application.Interfaces;
using ColabBoard.Domain.Entities;
using ColabBoard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ColabBoard.Infrastructure.Repositories;

public class StrokesRepository(AppDbContext context) : IStrokesRepository
{
    public async Task UpsertStrokeAsync(Stroke stroke)
    {
        var existingStroke = await context.Set<Stroke>()
            .Include(s => s.Room)
            .FirstOrDefaultAsync(s => s.ElementId == stroke.ElementId && s.Room.Id == stroke.Room.Id);

        if (existingStroke != null)
        {
            existingStroke.ElementAttributes = stroke.ElementAttributes;
            context.Set<Stroke>().Update(existingStroke);
        }
        else
        {
            await context.Set<Stroke>().AddAsync(stroke);
        }

        await context.SaveChangesAsync();
    }

    public async Task DeleteStrokeAsync(string elementId, Guid roomId)
    {
        var stroke = await context.Set<Stroke>()
            .Include(s => s.Room)
            .FirstOrDefaultAsync(s => s.ElementId == elementId && s.Room.Id == roomId);

        if (stroke != null)
        {
            context.Set<Stroke>().Remove(stroke);
            await context.SaveChangesAsync();
        }
    }
}