using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Application.Services;
using ColabBoard.Domain.Entities;
using ColabBoard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ColabBoard.Infrastructure.Repositories;

public class RoomsRepository : IRoomsRepository
{
    private readonly AppDbContext _context;
     
    private readonly HashingService _hashingService;

    public RoomsRepository(AppDbContext context, HashingService hashingService)
    {
        _context = context;
        _hashingService = hashingService;
    }
     
    public async Task<Room?> GetRoomByIdAsync(Guid id)
    {
        return  await _context.Set<Room>()
            .Include(x => x.Users)
            .Include(x => x.Strokes)
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Room?> GetRoomByNameAsync(string name)
    {
        return  await _context.Set<Room>()
            .Include(x => x.Users)
            .Where(x => x.Name == name)
            .FirstOrDefaultAsync();
         
    }

    public async Task<List<Room>?> GetRoomsAsync()
    {
        var rooms = await _context.Set<Room>()
            .AsNoTracking()
            .Include(x => x.Users)
            .ToListAsync();
         
        return rooms;
    }
     
    public async Task<Room> CreateRoomAsync(Room room)
    {

        _context.AttachRange(room.Users);
        
        var entityEntry = await _context.Set<Room>()
            .AddAsync(room);
         
        var newRoom = entityEntry.Entity;
         
        await _context.SaveChangesAsync();
         
        return newRoom;
    }

    public async Task<Room> UpdateRoomAsync(Room room)
    {
        var res = _context.Set<Room>()
            .Update(room).Entity;
         
        await _context.SaveChangesAsync();
         
        return res;
    }
    
    public async Task<bool> DeleteRoomAsync(Guid id)
    {
        var room = await _context.Set<Room>()
            .Include(r => r.Users)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (room == null)
            return false;

        _context.Set<Room>().Remove(room);
        await _context.SaveChangesAsync();
        return true;
    }
}