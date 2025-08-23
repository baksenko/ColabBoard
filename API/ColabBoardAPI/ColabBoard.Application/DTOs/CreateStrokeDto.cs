using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.DTOs;

public record CreateStrokeDto(List<Point> Points, string Color, Guid Roomid, int Size, bool IsErasing);
