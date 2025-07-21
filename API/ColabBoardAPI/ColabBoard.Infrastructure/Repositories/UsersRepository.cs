using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Application.Services;
using ColabBoard.Domain.Entities;
using ColabBoard.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ColabBoard.Infrastructure.Repositories;

public class UsersRepository : IUsersRepository
{
     
     private readonly AppDbContext _context;
     
     private readonly HashingService _hashingService;

     public UsersRepository(AppDbContext context, HashingService hashingService)
     {
          _context = context;
          _hashingService = hashingService;
     }
     
     public async Task<User?> GetUserByIdAsync(Guid id)
     {
         return  await _context.Set<User>()
               .AsNoTracking()
               .Where(x => x.Id == id)
               .FirstOrDefaultAsync();
     }

     public async Task<User?> GetUserByUserNameAsync(string username)
     {
         return  await _context.Set<User>()
             .AsNoTracking()
             .Where(x => x.Username == username)
             .FirstOrDefaultAsync();
         
     }

     public async Task<List<User>?> GetUsersAsync()
     {
         var users = await _context.Set<User>()
             .AsNoTracking()
             .ToListAsync();
         
         return users;
     }
     
     public async Task<User> CreateUserAsync(CreateUserDto user)
     {
         var _user = new User()
         {
             Username = user.Username,
             HashedPassword = _hashingService.HashPassword(user.Password)
         };
         
         var entityEntry = await _context.Set<User>()
             .AddAsync(_user);
         
         var newUser = entityEntry.Entity;
         
         await _context.SaveChangesAsync();
         
         return newUser;
     }

     public async Task<User> UpdateUserAsync(User user)
     {
         var res = _context.Set<User>()
             .Update(user).Entity;
         
         await _context.SaveChangesAsync();
         
         return res;
     }

     public async Task<bool> DeleteUserAsync(Guid id)
     {
         var deleted = await _context.Set<User>()
             .Where(x => x.Id == id)
             .ExecuteDeleteAsync();

         return deleted > 0;
     }
}