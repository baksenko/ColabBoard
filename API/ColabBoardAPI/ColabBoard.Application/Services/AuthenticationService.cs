using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ColabBoard.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ColabBoard.Application.Services;

public class AuthenticationService(IOptions<AuthSettings> authSettings)
{
    public string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim("username", user.Username),
            new Claim("id", user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            expires: DateTime.UtcNow.Add(authSettings.Value.TokenExpiration),
            claims: claims,
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authSettings.Value.SecretKey)),
                SecurityAlgorithms.HmacSha256Signature)
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}