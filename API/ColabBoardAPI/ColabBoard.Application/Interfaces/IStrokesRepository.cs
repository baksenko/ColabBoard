using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.Interfaces;

public interface IStrokesRepository
{   
    public Task UpsertStrokeAsync(Stroke stroke);
    public Task DeleteStrokeAsync(string elementId, Guid roomId);
}