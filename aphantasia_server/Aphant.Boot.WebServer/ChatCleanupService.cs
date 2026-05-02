using Aphant.Core.Contract.Data;

namespace Aphant.Boot.WebServer;

public class ChatCleanupService(IServiceScopeFactory _scopeFactory, ILogger<ChatCleanupService> _log)
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
            var result = await chatData.DeleteExpiredMessages();
            if (!result.IsSuccess)
                _log.LogWarning("Chat cleanup failed: {err}", result.Error!.Message);
        }
    }
}
