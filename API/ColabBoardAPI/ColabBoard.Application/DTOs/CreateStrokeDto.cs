using ColabBoard.Domain.Enums;


namespace ColabBoard.Application.DTOs;

public record CreateStrokeDto(int x, int y, Colors color, Guid room_id);