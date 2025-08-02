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
            .AsNoTracking()
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task<Room?> GetRoomByNameAsync(string name)
    {
        return  await _context.Set<Room>()
            .AsNoTracking()
            .Where(x => x.Name == name)
            .FirstOrDefaultAsync();
         
    }

    public async Task<List<Room>?> GetRoomsAsync()
    {
        var rooms = await _context.Set<Room>()
            .AsNoTracking()
            .ToListAsync();
         
        return rooms;
    }
     
    public async Task<Room> CreateRoomAsync(Room room)
    {
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
        var deleted = await _context.Set<Room>()
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync();

        return deleted > 0;
    }
}