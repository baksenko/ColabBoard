using ColabBoard.Application.DTOs;
using ColabBoard.Application.Interfaces;
using ColabBoard.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ColabBoard.Web.Hubs;

[Authorize]
public class WhiteBoardHub(IStrokesRepository strokesRepository, IRoomsRepository roomsRepository) : Hub
{
    public async Task SendStroke(Guid boardId, CreateStrokeDto stroke)
    {
        var room = await roomsRepository.GetRoomByIdAsync(boardId);
        
        strokesRepository.
        await Clients.Group(BoardId.ToString()).SendAsync("ReceoveStroke", stroke);
    }
    
    public override async Task OnConnectedAsync()
    {
        var boardId = Context.GetHttpContext().Request.Query["boardId"];
        await Groups.AddToGroupAsync(Context.ConnectionId, boardId);
        await base.OnConnectedAsync();
    }
    
}