using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.DTOs;

public record RoomDto(string Name, List<User> users, List<Stroke> strokes, Guid head_id);