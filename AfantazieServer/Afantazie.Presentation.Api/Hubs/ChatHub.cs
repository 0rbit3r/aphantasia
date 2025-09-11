using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Net.WebSockets;
using System.Security.Claims;
using Afantazie.Core.Localization;
using Afantazie.Service.Interface.UserSettings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Afantazie.Services.Interface.Chat;
using Afantazie.Presentation.Model.Dto.Chat;
using Afantazie.Core.Model;
using Afantazie.Core.Localization.SystemMessages;

namespace Afantazie.Presentation.Api.Hubs
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ChatHub(
        IChatService _service,
        IChatMessages _localization,
        IUserSettingsService _settings,

        ILogger<ChatHub> _logger) : Hub
    {

        public static HashSet<string> ConnectedIds = new HashSet<string>();

        public override async Task OnConnectedAsync()
        {
            var username = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            _logger.LogInformation("{username} entered the chat.", username);
            var color = (await _settings.GetColor(
                            int.Parse(Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? "0")))
                            .Payload
                            ?? "#ffffff";
            _service.AddMessage(new ChatMessage
            {
                Color = color,
                Message = $"{username} entered the chat.",
                Sender = "Systém",
                SentAt = DateTime.Now
            });

            ConnectedIds.Add(Context.ConnectionId);

            await Clients.Caller.SendAsync("ReceiveMessage",
                new MessageResponseDto
                {
                    Sender = "Systém",
                    Message = _localization.ConnectedSuccessfuly,
                    Color = Colors.System,
                });

            foreach (var message in _service.GetMessages())
            {
                await Clients.Caller.SendAsync("ReceiveMessage", message);
            }

            await Clients.Caller.SendAsync("ReceiveMessage",
                new MessageResponseDto
                {
                    Sender = "Systém",

                    Message = ConnectedIds.Count > 1
                        ? _localization.SomebodyIsHere
                        : _localization.NooneIsHere,
                    Color = Colors.System,
                });

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            ConnectedIds.Remove(Context.ConnectionId);

            var username = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            _logger.LogInformation("{username} left the chat.", username);

            _service.AddMessage(new ChatMessage
            {
                Color = Colors.System,
                Message = $"{username} left the chat.",
                Sender = "Systém",
                SentAt = DateTime.Now
            });

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string message)
        {
            var username = Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (username is null)
            {
                // This should never happen, but just in case. - Token should contain name claim always.
                return;
            }

            //todo - dont fetch db data everytime
            var color = (await _settings.GetColor(
                int.Parse(Context.User?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? "0")))
                .Payload
                ?? "#ffffff";

            await Clients
                .Others
                .SendAsync("ReceiveMessage",
                new MessageResponseDto
                {
                    Sender = username,
                    Message = message,
                    Color = color,
                });

            await Clients.Caller.SendAsync("ReceiveMessage",
                new MessageResponseDto
                {
                    Sender = _localization.You,
                    Message = message,
                    Color = color,
                });

            _service.AddMessage(new ChatMessage { Message = message, Sender = username, Color = color, SentAt = DateTime.Now });
        }
    }
}
