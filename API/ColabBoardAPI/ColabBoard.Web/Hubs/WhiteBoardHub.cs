using ColabBoard.Application.Interfaces;
using ColabBoard.Domain.Entities;
using Microsoft.AspNetCore.SignalR;

namespace ColabBoard.Web.Hubs;

public class WhiteBoardHub : Hub
{
    IStrokesRepository _strokesRepository;

    public WhiteBoardHub(IStrokesRepository strokesRepository)
    {
        _strokesRepository = strokesRepository;
    }
    public async Task SendStroke(Guid BoardId, Stroke stroke)
    {
        await Clients.Group(BoardId.ToString()).SendAsync("ReceoveStroke", stroke);
        
        
    }
    
    public override async Task OnConnectedAsync()
    {
        var boardId = Context.GetHttpContext().Request.Query["boardId"];
        await Groups.AddToGroupAsync(Context.ConnectionId, boardId);
        await base.OnConnectedAsync();
    }
    
}