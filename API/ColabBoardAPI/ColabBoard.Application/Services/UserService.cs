using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.Services;

public class UserService(IUsersRepository usersRepository, HashingService hashingService, AuthenticationService authenticationService)
{
    public async Task RegisterAsync(CreateUserDto userDto)
    {
        User user = new User()
        {
            Username = userDto.Username
        };
        
        if (await usersRepository.GetUserByUserNameAsync(user.Username) != null)
        {
            throw new Exception("Username already exists");
        }
        
        var paswordhash = hashingService.HashPassword(userDto.Password);
        user.HashedPassword = paswordhash;

        var newuser = await usersRepository.CreateUserAsync(user);
    }

    public async Task<string> LoginAsync(string username, string password)
    {
        var user = await usersRepository.GetUserByUserNameAsync(username);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (hashingService.VerifyPassword(user.HashedPassword, password))
        {
            return authenticationService.GenerateJwtToken(user);
        }
        {
            throw new Exception("Password is incorrect");
        }
    }
}