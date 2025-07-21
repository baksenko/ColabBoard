using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.DTOs;

public record CreateUserDto(string Username, string Password);

