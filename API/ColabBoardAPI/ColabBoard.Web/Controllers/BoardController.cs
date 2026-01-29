using System.Security.Claims;
using System.Text.Json;
using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Application.Services;
using ColabBoard.Domain.Entities;
using ColabBoard.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace ColabBoard.Web.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class BoardController(
    RoomService roomService,
    IUsersRepository usersRepository,
    UserService userService,
    IRoomsRepository roomsRepository) : ControllerBase
{

    [HttpPost]
    public async Task<IActionResult> CreateBoard([FromForm] CreateBoardDto board)
    {
        try
        {

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var user = await usersRepository.GetUserByIdAsync(Guid.Parse(userId));

            var room = await roomService.CreateRoomAsync(board.name, board.password, user);
            return Ok(room);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("{boardid}")]
    public async Task<IActionResult> LeaveBoard(string boardid)
    {

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token.");
        }

        try
        {
            await roomService.DeleteUserFromRoomAsync(boardid, userId);
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetUserBoardsById()
    {
        try
        {
            var userid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userid))
            {
                return Unauthorized("User ID not found in token.");
            }

            return Ok(await roomService.GetAllUserRoomsAsync(Guid.Parse(userid)));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost]
    [Route("JoinBoard")]
    public async Task<IActionResult> JoinBoard([FromForm] string roomName, [FromForm] string password)
    {
        try
        {
            var userid = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await usersRepository.GetUserByIdAsync(userid);

            var room = await roomService.AddUserToRoomAsync(roomName, password, user);

            return Ok(room);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }

    }


    [HttpGet]
    [Route("GetBoardById/{boarId}")]
    public async Task<IActionResult> GetBoardById(string boarId)
    {
        try
        {
            var room = await roomsRepository.GetRoomByIdAsync(Guid.Parse(boarId));
            
            if (room == null) return NotFound();

            var strokes = room.Strokes.Select(s => new StrokeDto(s));
            
            return Ok(new RoomDto(room.Id,
                room.Name,
                room.Users.Select(x => x.Username).ToList(),
                strokes.ToList()
                ));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpDelete]
    [Route("{boardid}/{delete}")]
    public async Task<IActionResult> DeleteStrokes(Guid boardid, bool delete)
    {
        try
        {
            if (delete)
            {
               await roomService.DeleteStrokesAsync(boardid);
            }
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}