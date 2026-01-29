using System.Diagnostics.Eventing.Reader;
using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.Services;

public class RoomService(IRoomsRepository roomsRepository, HashingService hashingService, IStrokesRepository strokesRepository)
{
    public async Task<RoomDto> CreateRoomAsync(string name, string password, User user)
    {

        if (await roomsRepository.GetRoomByNameAsync(name) != null)
        {
            throw new Exception("Board with this name already exists");
        }
        
        var room = new Room
        {
            Name = name,
            HashedPassword = hashingService.HashPassword(password),
            Users = new List<User> { user },
            Strokes = new List<Stroke>()
                
        };
        
        var entity = await roomsRepository.CreateRoomAsync(room);

        List<string> names = new List<string>();

        foreach (var user_ in entity.Users)
        {
            names.Add(user_.Username);
        }
        return new RoomDto(entity.Id, entity.Name, names, new List<StrokeDto>());
    }

    public async Task DeleteUserFromRoomAsync(string roomId, string userId)
    {
        var room = await roomsRepository.GetRoomByIdAsync(Guid.Parse(roomId));
        
        var userToRemove =  room.Users.FirstOrDefault(u => u.Id == Guid.Parse(userId));
        
        if (userToRemove == null)
            return;

        room.Users.Remove(userToRemove);

        if (room.Users.Count() == 0)
        {
            await roomsRepository.DeleteRoomAsync(room.Id);
        }
        else
        {
            await roomsRepository.UpdateRoomAsync(room);
        }
    }

    public async Task<List<RoomDto>> GetAllUserRoomsAsync(Guid userId)
    {
        var rooms = await roomsRepository.GetRoomsAsync();
        
        List<RoomDto> roomDtos = new List<RoomDto>();

        foreach (var room in rooms)
        {
            if (room.Users.Any(x => x.Id == userId))
            {
                roomDtos.Add(new RoomDto(
                    room.Id,
                    room.Name,
                    room.Users.Select(x => x.Username).ToList(),
                    new List<StrokeDto>()));
            }
        }
        
        return roomDtos;
    }

    public async Task<RoomDto> AddUserToRoomAsync(string roomName, string password, User user)
    {
        var room = await roomsRepository.GetRoomByNameAsync(roomName);

        if (room == null)
        {
            throw new Exception("room not found");
        }

        if (hashingService.VerifyPassword(password, room.HashedPassword))
        {
            room.Users.Add(user);
            await roomsRepository.UpdateRoomAsync(room);
            
            return new RoomDto(room.Id, room.Name, room.Users.Select(x => x.Username).ToList(), new List<StrokeDto>());
        }
        else
        {
            throw new Exception("password is not correct");
        }
    }
    
    
    public async Task<HttpResponseMessage?> AddStroke(CreateStrokeDto stroke)
    {
        var room = await roomsRepository.GetRoomByIdAsync(stroke.RoomId);

        if (room == null) throw new Exception("room not found");

        var stroke_ = new Stroke
        {
            ElementId = stroke.ElementId,
            ElementAttributes = stroke.ElementAttributes,
            Room = room
        };
        
        await strokesRepository.UpsertStrokeAsync(stroke_);

        return null;
    }

    public async Task DeleteStrokesAsync(Guid roomid)
    {
        var room = await roomsRepository.GetRoomByIdAsync(roomid);
        if (room == null)
        {
            throw new Exception("room not found");
        }
        
        room.Strokes.Clear();
        await roomsRepository.UpdateRoomAsync(room);
    }

    public async Task RemoveStroke(string elementId, Guid roomId)
    {
        await strokesRepository.DeleteStrokeAsync(elementId, roomId);
    }
}