using ColabBoard.Application.DTOs;
using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.Interfaces;

public interface IStrokesRepository
{   
    public Task CreateStrokeAsync(Stroke stroke);
    
    public Task DeleteStrokesAsync(Guid roomid, decimal cordx, decimal cordy);
}