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

    public async Task<string> LoginAsync(string username, string password)
    {
        var user = await usersRepository.GetUserByUserNameAsync(username);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (hashingService.VerifyPassword(password, user.HashedPassword))
        {
            return authenticationService.GenerateJwtToken(user);
        }
        {
            throw new Exception("Password is incorrect");
        }
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