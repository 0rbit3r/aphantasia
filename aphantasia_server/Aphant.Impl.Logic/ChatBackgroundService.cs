using Aphant.Core.Contract.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Logic;

public class ChatBackgroundService(IServiceScopeFactory _scopeFactory, ILogger<ChatBackgroundService> _log)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(15);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(Interval, stoppingToken);

            await using var scope = _scopeFactory.CreateAsyncScope();
            var chatData = scope.ServiceProvider.GetRequiredService<IChatDataContract>();
            var result = await chatData.DeleteExpiredMessages(TimeSpan.FromHours(33));
            if (!result.IsSuccess)
                _log.LogWarning("Chat cleanup failed: {err}", result.Error!.Message);
        }
    }
}
