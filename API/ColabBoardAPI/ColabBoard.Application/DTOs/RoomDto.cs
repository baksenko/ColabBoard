using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.DTOs;

public record RoomDto(Guid id, string Name, List<string> userNames, List<StrokeDto> strokes);