using ColabBoard.Application;
using ColabBoard.Application.Interfaces;
using ColabBoard.Application.Services;
using ColabBoard.Infrastructure.Data;
using ColabBoard.Infrastructure.Repositories;
using ColabBoard.Web.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseNpgsql(builder.Configuration.GetConnectionString("postgres")));
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IRoomsRepository, RoomsRepository>();
builder.Services.AddScoped<IStrokesRepository, StrokesRepository>();
builder.Services.AddSingleton<HashingService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddSingleton<AuthenticationService>();
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("AuthSettings"));
builder.Services.AddAuth(builder.Configuration);
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => 
    options.AddDefaultPolicy(builder => builder.WithOrigins("http://localhost:3000")
        .AllowAnyMethod()
        .AllowAnyHeader())
    );



var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();