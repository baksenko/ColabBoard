using System.Text;
using ColabBoard.Application;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace ColabBoard.Web.Extensions;

public static class AuthExtension
{
    public static IServiceCollection AddAuth(this IServiceCollection serviceCollection, IConfiguration configuration)
    {
        var settings = configuration.GetSection("AuthSettings").Get<AuthSettings>();

        if (settings == null || string.IsNullOrEmpty(settings.SecretKey))
        {
            throw new InvalidOperationException("AuthSettings:SecretKey не настроен в конфигурации приложения");
        }

        serviceCollection.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SecretKey))
                };
            });

        return serviceCollection;
    }
}