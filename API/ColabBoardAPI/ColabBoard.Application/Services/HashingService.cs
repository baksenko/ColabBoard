using ColabBoard.Domain.Entities;


namespace ColabBoard.Application.Services;

public class HashingService
{

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string hashedPassword, string providedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(hashedPassword, providedPassword);
    }
}