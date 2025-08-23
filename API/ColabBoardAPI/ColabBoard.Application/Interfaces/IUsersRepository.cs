using ColabBoard.Application.DTOs;
using ColabBoard.Domain.Entities;

namespace ColabBoard.Application.Interfaces;


public interface IUsersRepository
{
    public Task<User> CreateUserAsync(User user);
    
    public Task<User?> GetUserByIdAsync(Guid id);

    public Task<User?> GetUserByUserNameAsync(string username);
    
    public Task<List<User>?> GetUsersAsync();
    
    public Task<bool> DeleteUserAsync(Guid id);

    public Task<User> UpdateUserAsync(User user);
    
}