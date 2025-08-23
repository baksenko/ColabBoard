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
    

     public UsersRepository(AppDbContext context)
     {
          _context = context;
     }
    

     public async Task<User?> GetUserByUserNameAsync(string username)
     {
         return await _context.Set<User>()
             .AsNoTracking()
             .Where(x => x.Username == username)
             .Include(x => x.Rooms)
             .FirstOrDefaultAsync();
         
     }

     public async Task<List<User>?> GetUsersAsync()
     {
         var users = await _context.Set<User>()
             .AsNoTracking()
             .ToListAsync();
         
         return users;
     }
     
     public async Task<User> CreateUserAsync(User user)
     {
         
         var entityEntry = await _context.Set<User>()
             .AddAsync(user);
         
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

     public async Task<User?> GetUserByIdAsync(Guid id)
     {
         return await _context.Set<User>()
             .AsNoTracking()
             .Where(x => x.Id == id)
             .Include(x => x.Rooms)
             .FirstOrDefaultAsync();
     }
     
}