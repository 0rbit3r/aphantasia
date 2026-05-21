using Aphant.Core.Contract.Configuration;
using Aphant.Core.Contract.Logic;
using Aphant.Core.Contracta.Configuration;
using Aphant.Impl.Logic.Epochs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aphant.Boot.LayoutDaemon;

public class EpochBackgroundService : BackgroundService
{

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EpochBackgroundService> _log;
    private readonly EpochOptions _epochOpts;

    public EpochBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<EpochBackgroundService> log,
        IOptions<EpochOptions> opts)
    {
        _scopeFactory = scopeFactory;
        _log = log;
        _epochOpts = opts.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken cancelToken)
    {
        while (!cancelToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var epochService = scope.ServiceProvider.GetRequiredService<IEpochLogicContract>();
                await epochService.CheckContextAndCreateEpoch();
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _log.LogError(ex, "Epoch management check failed, will retry after delay");
            }

            await Task.Delay(_epochOpts.ManageEpochsEveryXMinutes * 1000 * 60, cancelToken);
        }
    }
}
