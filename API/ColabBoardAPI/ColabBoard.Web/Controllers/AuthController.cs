using System.Text.Json;
using ColabBoard.Application.DTOs;
using ColabBoard.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace ColabBoard.Web.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(UserService userService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromForm] CreateUserDto user)
    {
        try
        {
            await userService.RegisterAsync(user);
            return Ok();
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromForm] string  username, [FromForm] string password)
    {
        try
        {
            var token = await userService.LoginAsync(username, password);
            return Ok(new {token});
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}