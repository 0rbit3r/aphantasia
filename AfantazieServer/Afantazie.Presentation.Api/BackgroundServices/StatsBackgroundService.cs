using Afantazie.Presentation.Api.Hubs;
using Afantazie.Presentation.Model.Dto.Chat;
using Afantazie.Service.Interface.SiteActivity;
using Afantazie.Services.Interface.Chat;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;

namespace Afantazie.Presentation.Api.BackgroundServices
{
    public class StatsBackgroundService: IHostedService, IDisposable
    {
        private Timer? _timer;
        private readonly IStatsService _service;
        private readonly IHubContext<StatsHub> _context;

        public StatsBackgroundService(IStatsService service, IHubContext<StatsHub> hubContext)
        {
            _service = service;
            _context = hubContext;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(SendStats, null, TimeSpan.Zero, TimeSpan.FromSeconds(4));
            return Task.CompletedTask;
        }

        private void SendStats(object? state)
        {
            var stats = new StatsResponseDto
            {
                 UsersCount = _service.GetStats()
            };

            _context.Clients.All.SendAsync("ReceiveStats", stats);
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }

}
