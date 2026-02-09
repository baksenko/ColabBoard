using System.Security.Claims;
using System.Text.Json;
using ColabBoard.Application.DTOs;
using ColabBoard.Application.Services;
using Microsoft.AspNetCore.Authorization;
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
    public async Task<IActionResult> Login([FromForm] string  username, [FromForm] string Password)
    {
        try
        {
            var result = await userService.LoginAsync(username, Password);
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromForm] string username, [FromForm] string refreshToken)
    {
        try
        {
            var result = await userService.RefreshTokenAsync(username, refreshToken);
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Validate()
    {
        try
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized("User Name not found in token.");
            }

            return Ok(new { userName });
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}