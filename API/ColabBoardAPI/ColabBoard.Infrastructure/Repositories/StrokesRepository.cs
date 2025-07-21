using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Domain.Entities;
using ColabBoard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ColabBoard.Infrastructure.Repositories;

public class StrokesRepository: IStrokesRepository
{
    private readonly AppDbContext _context;

    public StrokesRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Stroke>?> GetStrokesByRoomIdAsync(Guid roomId)
    {
        var room = await _context
            .Set<Room>()
            .AsNoTracking()
            .Where(x => x.Id == roomId)
            .FirstOrDefaultAsync();
        
        return room?.Strokes;
    }

    public async Task<Stroke> CreateStrokeAsync(CreateStrokeDto stroke)
    {
        var roomid = stroke.room_id;
        
        var room = await _context
            .Set<Room>()
            .AsNoTracking()
            .Where(x => x.Id == roomid)
            .FirstOrDefaultAsync();

        var new_stroke = new Stroke()
        {
            Color = stroke.color,
            Cordx = stroke.x,
            Cordy = stroke.y,
            Room = room
        };
        
        room.Strokes.Add(new_stroke);
        await _context.SaveChangesAsync();

        return new_stroke;
    }

    public async Task<bool> DeleteStrokeAsync(Guid room_id, int cordx, int cordy)
    {
        var room = await _context
            .Set<Room>()
            .AsNoTracking()
            .Where(x => x.Id == room_id)
            .FirstOrDefaultAsync();

        bool removed = room
            .Strokes
            .RemoveAll(x => x.Cordx == cordx && x.Cordy == cordy) > 0;
        
        await _context.SaveChangesAsync();
        
        return removed;
    }
}