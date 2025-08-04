using System.Text.Json;
using ColabBoard.Application.Services;
using ColabBoard.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace ColabBoard.Web.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class BoardController(RoomService roomService, UsersRepository usersRepository) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateBoard(string name, string password)
    {
        try
        {
            var userId = JwtRegisteredClaimNames.Sub;
            var user = await usersRepository.GetUserByIdAsync(Guid.Parse(userId));

            var room = await roomService.CreateRoomAsync(name, password, user);
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}