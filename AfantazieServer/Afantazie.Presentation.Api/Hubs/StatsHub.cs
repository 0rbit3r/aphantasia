using Afantazie.Presentation.Model;
using Afantazie.Presentation.Model.Dto.Chat;
using Afantazie.Service.Interface.SiteActivity;
using Afantazie.Services.Interface.Chat;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Api.Hubs
{
    public class StatsHub(
        ILogger<StatsHub> _logger,
        IStatsService _service) : Hub
    {

        public override async Task OnConnectedAsync()
        {
            _service.IncrementStats();
            var userCount = _service.GetStats();
            _logger.LogInformation("New Stats hub connection. User count: {count}", userCount);

            var stats = new StatsResponseDto
            {
                UsersCount = userCount
            };


            // Broadcast the stats to all connected clients
            await Clients.Caller.SendAsync("ReceiveStats", stats);

            await base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            _service.DecrementStats();
            return base.OnDisconnectedAsync(exception);
        }
    }
}
