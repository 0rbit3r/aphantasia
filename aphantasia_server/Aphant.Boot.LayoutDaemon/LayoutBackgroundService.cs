using Aphant.Core.Contract;
using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database;
using Microsoft.EntityFrameworkCore;
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
    private readonly IOptionsMonitor<FdlLayoutOptions> _layoutOpts;

    private int _iteration;

    public LayoutBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<LayoutBackgroundService> log,
        IOptions<LayoutDaemonOptions> opts,
        IOptionsMonitor<FdlLayoutOptions> layoutOpts)
    {
        _scopeFactory = scopeFactory;
        _log = log;
        _opts = opts.Value;
        _layoutOpts = layoutOpts;
    }

    protected override async Task ExecuteAsync(CancellationToken cancelToken)
    {
        while (!cancelToken.IsCancellationRequested)
        {
            await using var scope = _scopeFactory.CreateAsyncScope();

            var thoughtOpts = _layoutOpts.Get("Thought");
            var chatOpts = _layoutOpts.Get("Chat");

            await LayoutThoughts(scope, thoughtOpts);
            await LayoutChat(scope, chatOpts);

            _log.LogInformation("Finished run {iter}", _iteration++);
            await Task.Delay(_opts.WaitBetweenRuns * 1000, cancelToken);
        }
    }

    private async Task LayoutThoughts(AsyncServiceScope scope, FdlLayoutOptions opts)
    {
        var epochRepo = scope.ServiceProvider.GetRequiredService<IEpochDataContract>();
        var layoutService = scope.ServiceProvider.GetRequiredService<ILayoutLogicContract>();

        var epochResult = await epochRepo.GetEpochAsync();
        if (!epochResult.IsSuccess)
        {
            _log.LogError("Failed to get last epoch: {err}", epochResult.Error!.Message);
            return;
        }

        var thoughts = epochResult.Payload!.Thoughts;
        var nodes = thoughts.Select(t => new LayoutNode
        {
            Id = t.Id,
            X = t.X,
            Y = t.Y,
            Size = t.Size,
            Color = t.Color,
            Shape = t.Shape,
            Links = t.Links.ToList(),
            BackLinks = t.Replies.ToList(),
        }).ToList();

        var laid = layoutService.LayoutNodes(nodes, opts, opts.IterationsPerRun);

        await SaveThoughtPositions(laid);
    }

    private async Task LayoutChat(AsyncServiceScope scope, FdlLayoutOptions opts)
    {
        var chatData = scope.ServiceProvider.GetRequiredService<IChatDataContract>();
        var layoutService = scope.ServiceProvider.GetRequiredService<ILayoutLogicContract>();

        var messagesResult = await chatData.GetActiveMessages();
        if (!messagesResult.IsSuccess || messagesResult.Payload!.Count == 0)
            return;

        var messages = messagesResult.Payload!;
        var nodes = messages.Select(m => new LayoutNode
        {
            Id = m.Id,
            X = m.X,
            Y = m.Y,
            Size = 3,// todo on fe this is dynamically computed and this is just temporary fix if even that
            Links = m.ParentId.HasValue ? [m.ParentId.Value] : [],
        }).ToList();

        var laid = layoutService.LayoutNodes(nodes, opts, opts.IterationsPerRun);

        // if (_opts.ExportImageAfterXRuns > 0 && _iteration % _opts.ExportImageAfterXRuns == 0)
        // {
        //     var path = $"{_opts.LayoutPNGsPath}{DateTime.Now:yyyy-MM-dd_HHmmss}.png";
        //     var printResult = await layoutService.PrintLayout(path, laid, opts);
        //     if (!printResult.IsSuccess)
        //         _log.LogWarning("Failed to export layout image: {err}", printResult.Error!.Message);
        //     else
        //         _log.LogInformation("Layout image exported: {path}", path);
        // } //todo - move this into separate method and make it configurable for multiple modes

        var nodeMap = laid.ToDictionary(n => n.Id);
        foreach (var msg in messages)
        {
            if (nodeMap.TryGetValue(msg.Id, out var node))
            {
                msg.X = node.X;
                msg.Y = node.Y;
            }
        }

        await chatData.UpdatePositions(messages);
    }

    private async Task<Result> SaveThoughtPositions(List<LayoutNode> nodes)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AphantasiaDataContext>();

            foreach (var node in nodes)
            {
                await db.Thoughts
                    .Where(t => t.Id == node.Id)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(t => t.PositionX, node.X)
                        .SetProperty(t => t.PositionY, node.Y));
            }

            return Result.Success();
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to save positions");
            return Error.ExceptionThrown(e);
        }
    }
}
