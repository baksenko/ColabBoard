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

         await usersRepository.CreateUserAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(string username, string password)
    {
        var user = await usersRepository.GetUserByUserNameAsync(username);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (hashingService.VerifyPassword(password, user.HashedPassword))
        {
            var token = authenticationService.GenerateJwtToken(user);
            var refreshToken = authenticationService.GenerateRefreshToken();
            
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            
            await usersRepository.UpdateUserAsync(user);

            return new AuthResponseDto(token, refreshToken);
        }
        else
        {
            throw new Exception("Password is incorrect");
        }
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string username, string refreshToken)
    {
        var user = await usersRepository.GetUserByUserNameAsync(username);
        if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new Exception("Invalid refresh token");
        }

        var newToken = authenticationService.GenerateJwtToken(user);
        var newRefreshToken = authenticationService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        
        await usersRepository.UpdateUserAsync(user);

        return new AuthResponseDto(newToken, newRefreshToken);
    }

    public async Task<UserDto> GetByNameUserAsync(string username)
    {
        var user = await usersRepository.GetUserByUserNameAsync(username);
        if (user == null)
        {
            throw new Exception("user not found");
        }

        List<string> roomnames = new List<string>();

        if (user.Rooms.Count != 0)
        {
            foreach (var room in user.Rooms)
            {
                roomnames.Add(room.Name);
            }   
        }
        
        return new UserDto(user.Username, roomnames);
    }
    
    public async Task<UserDto> GetByIdUserAsync(Guid id)
    {
        var user = await usersRepository.GetUserByIdAsync(id);
        if (user == null)
        {
            throw new Exception("user not found");
        }

        List<string> roomnames = new List<string>();

        if (user.Rooms.Count != 0)
        {
            foreach (var room in user.Rooms)
            {
                roomnames.Add(room.Name);
            }   
        }
        
        return new UserDto(user.Username, roomnames);
    }
}