using System.Collections.Concurrent;
using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Application.Services;
using ColabBoard.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ColabBoard.Web.Hubs;

[Authorize]
public class WhiteBoardHub(RoomService roomService, UserService userService) : Hub
{

    private static Dictionary<string, List<string>> _activeUsers = new();
    private static ConcurrentDictionary<string, (string BoardId, string Username)> _connections = new();
    private static readonly object _lock = new(); 
    
    public override async Task OnConnectedAsync()
    {
        
        var boardId = Context.GetHttpContext().Request.Query["boardId"].ToString();
        var username = Context.GetHttpContext().Request.Query["username"].ToString();
        _connections[Context.ConnectionId] = (boardId, username);

        await Groups.AddToGroupAsync(Context.ConnectionId, boardId);

        lock (_lock)
        {
            if (!_activeUsers.ContainsKey(boardId))
                _activeUsers[boardId] = new List<string>();
            
            _activeUsers[boardId].Add(username);
        }

        await Clients.Group(boardId).SendAsync("GetActiveUsers", _activeUsers[boardId]);
        await base.OnConnectedAsync();
    }


    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_connections.TryRemove(Context.ConnectionId, out var info))
        {
            var boardId = info.BoardId;
            var username = info.Username;

            lock (_lock)
            {
                if (_activeUsers.ContainsKey(boardId))
                {
                    _activeUsers[boardId].Remove(username);

                    if (_activeUsers[boardId].Count == 0)
                        _activeUsers.Remove(boardId);
                }
            }

            if (_activeUsers.ContainsKey(boardId))
            {
                await Clients.Group(boardId).SendAsync("GetActiveUsers", _activeUsers[boardId]);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }

    public async Task ClearBoard(Guid boardid)
    {
        await roomService.DelteStrokesAsync(boardid);
        await Clients.Group(boardid.ToString()).SendAsync("RemoveStrokes");
    }
    
    public async Task SendStroke(CreateStrokeDto stroke)
    {
        var result = await roomService.AddStroke(stroke);
        await Clients.Group(stroke.Roomid.ToString()).SendAsync("ReceiveStroke", stroke);
    }
}