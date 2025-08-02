using ColabBoard.Application.DTOs;
using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.Interfaces;

public interface IRoomsRepository
{
    public Task<Room> CreateRoomAsync(Room room);
    
    public Task<Room?> GetRoomByIdAsync(Guid id);
    
    public Task<Room?> GetRoomByNameAsync(string name);
    
    public Task<List<Room>?> GetRoomsAsync();
    
    public Task<bool> DeleteRoomAsync(Guid id);

    public Task<Room> UpdateRoomAsync(Room room);
}