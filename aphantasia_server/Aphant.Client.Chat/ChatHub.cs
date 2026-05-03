using Aphant.Core.Contract.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Aphant.Client.Chat;

[Authorize]
public class ChatHub(IChatDataContract _chatData) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var messages = await _chatData.GetActiveMessages();
        if (messages.IsSuccess)
            await Clients.Caller.SendAsync("InitialMessages", messages.Payload);

        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string content, string? parentId, double x, double y)
    {
        var userId = GetUserId();
        if (userId is null) return;

        content = content.Trim();
        if (string.IsNullOrEmpty(content) || content.Length > 300) return;

        Guid? parentGuid = parentId is not null && Guid.TryParse(parentId, out var g) ? g : null;

        var result = await _chatData.InsertMessage(userId.Value, content, parentGuid, x, y);
        if (result.IsSuccess)
            await Clients.All.SendAsync("ReceiveMessage", result.Payload);
    }

    public async Task DeleteMessage(string messageId)
    {
        var userId = GetUserId();
        if (userId is null) return;
        if (!Guid.TryParse(messageId, out var msgGuid)) return;

        var messages = await _chatData.GetActiveMessages();
        if (!messages.IsSuccess) return;
        var message = messages.Payload?.FirstOrDefault(m => m.Id == msgGuid);
        if (message is null || message.AuthorId != userId) return;

        var result = await _chatData.DeleteMessage(msgGuid);
        if (result.IsSuccess)
            await Clients.All.SendAsync("MessageDeleted", messageId);
    }

    private Guid? GetUserId()
        => Guid.TryParse(Context.User?.Claims.FirstOrDefault(c => c.Type == "id")?.Value, out var id)
            ? id
            : null;
}
