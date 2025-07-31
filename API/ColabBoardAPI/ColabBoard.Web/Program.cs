using ColabBoard.Application;
using ColabBoard.Application.Services;
using ColabBoard.Infrastructure.Data;
using ColabBoard.Infrastructure.Repositories;
using ColabBoard.Web.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<UsersRepository>();
builder.Services.AddScoped<RoomsRepository>();
builder.Services.AddScoped<StrokesRepository>();
builder.Services.AddSingleton<HashingService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddSingleton<AuthenticationService>();
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("AuthSettings"));
builder.Services.AddAuth(builder.Configuration);


var app = builder.Build();


app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();