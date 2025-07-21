using ColabBoard.Application.DTOs;
using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.Interfaces;

public interface IStrokesRepository
{   
    public Task<Stroke> CreateStrokeAsync(CreateStrokeDto stroke);
    
    public Task<List<Stroke>?> GetStrokesByRoomIdAsync(Guid roomId);
    
    public Task<bool> DeleteStrokeAsync(Guid room_id, int cordx, int cordy);
}