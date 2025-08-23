using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.DTOs;

public record strokeDTO(int Size, string Color, List<PointDto> Points);