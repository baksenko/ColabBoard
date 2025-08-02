using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.Services;

public class RoomService(IRoomsRepository roomsRepository, HashingService hashingService)
{
    public async Task<RoomDto> CreateRoomAsync(string name, string password, User user)
    {
        var room = new Room
        {
            Name = name,
            HashedPassword = hashingService.HashPassword(password),
            Users = new List<User> { user },
            HeadID = user.Id,
            Strokes = new List<Stroke>()
                
        };
        var entity = await roomsRepository.CreateRoomAsync(room);
        
        return new RoomDto(entity.Name, entity.Users, entity.Strokes, entity.HeadID);
    }
}   