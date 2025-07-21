using ColabBoard.Domain.Entities;
using Microsoft.AspNetCore.SignalR;

namespace ColabBoard.Web.Hubs;

public class WhiteBoardHub : Hub
{
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