using Aphant.Core.Contract;
using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aphant.Boot.LayoutDaemon;

public class LayoutBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LayoutBackgroundService> _log;
    private readonly LayoutDaemonOptions _opts;

    private int Iteration { get; set; }

    public LayoutBackgroundService(IServiceScopeFactory scopeFactory, ILogger<LayoutBackgroundService> log,
        IOptions<LayoutDaemonOptions> opts)
    {
        _scopeFactory = scopeFactory;
        _log = log;
        _opts = opts.Value;
    }
    protected override async Task ExecuteAsync(CancellationToken cancelToken)
    {
        while (!cancelToken.IsCancellationRequested)
        {
            await using var scope = _scopeFactory.CreateAsyncScope();

            var epochRepo = scope.ServiceProvider.GetRequiredService<IEpochDataContract>();

            var lastEpochResult = await epochRepo.GetEpochAsync();
            if (!lastEpochResult.IsSuccess)
            {
                _log.LogError("Failed to get last epoch: {err}", lastEpochResult.Error!.Message);
                return;
            }

            var layoutService = scope.ServiceProvider.GetRequiredService<ILayoutLogicContract>();

            var result = await layoutService.LayoutThoughts(lastEpochResult.Payload!.Thoughts, _opts.IterationsPerRun);

            if (result.IsSuccess)
            {
                await SavePositions(result.Payload!);
            }

            _log.LogInformation("Finished run {iter}", Iteration);

            Iteration++;
            await Task.Delay(_opts.WaitBetweenRuns * 1000);
        }
    }

    private async Task<Result> SavePositions(List<ThoughtNode> nodes)
    {
        try
        {

            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AphantasiaDataContext>();

            foreach (var node in nodes)
            {
                var thought = db.Thoughts.SingleOrDefault(t => t.Id == node.Id);
                if (thought is null) continue;

                thought.PositionX = node.X;
                thought.PositionY = node.Y;
            }

            db.SaveChanges();

            return Result.Success();
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to save positions");
            return Error.ExceptionThrown(e);
        }
    }
}