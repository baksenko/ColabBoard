using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Application.Services;
using ColabBoard.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ColabBoard.Web.Hubs;

[Authorize]
public class WhiteBoardHub(RoomService roomService) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var boardId = Context.GetHttpContext().Request.Query["boardId"];
        await Groups.AddToGroupAsync(Context.ConnectionId, boardId);
        await base.OnConnectedAsync();
    }

    public async Task ClearBoard(Guid boardid)
    {
        await roomService.DelteStrokesAsync(boardid);
        await Clients.Group(boardid.ToString()).SendAsync("RemoveStrokes");
    }
    
    public async Task SendStroke(CreateStrokeDto stroke)
    {
            await roomService.AddStroke(stroke);
            await Clients.Group(stroke.Roomid.ToString()).SendAsync("ReceiveStroke", stroke);
    }
    
}