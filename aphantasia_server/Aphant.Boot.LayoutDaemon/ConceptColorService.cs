using Aphant.Core.Contract.Configuration;
using Aphant.Impl.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aphant.Boot.LayoutDaemon;

public class ConceptColorService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ConceptColorService> _log;
    private readonly LayoutServiceOptions _opts;

    public ConceptColorService(
        IServiceScopeFactory scopeFactory,
        ILogger<ConceptColorService> log,
        IOptions<LayoutServiceOptions> opts)
    {
        _scopeFactory = scopeFactory;
        _log = log;
        _opts = opts.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken cancelToken)
    {
        while (!cancelToken.IsCancellationRequested)
        {
            try
            {
                await RecomputeConceptColors(cancelToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _log.LogError(ex, "Concept color recompute failed");
            }

            await Task.Delay(_opts.WaitSecondsBetweenRuns * 1000, cancelToken);
        }
    }

    private async Task RecomputeConceptColors(CancellationToken cancelToken)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AphantasiaDataContext>();

        var data = await db.ThoughtConcepts
            .Select(tc => new { tc.ConceptTag, tc.Thought.Color, tc.Thought.SizeMultiplier })
            .ToListAsync(cancelToken);

        var blended = data
            .GroupBy(x => x.ConceptTag)
            .ToDictionary(g => g.Key, g => BlendColors(g.Select(x => (x.Color, x.SizeMultiplier))));

        foreach (var (tag, color) in blended)
        {
            await db.Concepts
                .Where(c => c.Tag == tag)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.Color, color));
        }

        _log.LogInformation("Recomputed colors for {count} concepts", blended.Count);
    }

    private static string BlendColors(IEnumerable<(string Color, int Size)> thoughts)
    {
        double totalWeight = 0, r = 0, g = 0, b = 0;
        foreach (var (color, size) in thoughts)
        {
            if (!TryParseHex(color, out var rgb)) continue;
            var w = Math.Max(1, size);
            r += rgb.R * w;
            g += rgb.G * w;
            b += rgb.B * w;
            totalWeight += w;
        }
        if (totalWeight == 0) return "#cccccc";
        return $"#{(int)(r / totalWeight):X2}{(int)(g / totalWeight):X2}{(int)(b / totalWeight):X2}";
    }

    private static bool TryParseHex(string color, out (int R, int G, int B) rgb)
    {
        rgb = default;
        if (color is not { Length: 7 } || color[0] != '#') return false;
        if (!int.TryParse(color[1..3], System.Globalization.NumberStyles.HexNumber, null, out var r)) return false;
        if (!int.TryParse(color[3..5], System.Globalization.NumberStyles.HexNumber, null, out var g)) return false;
        if (!int.TryParse(color[5..7], System.Globalization.NumberStyles.HexNumber, null, out var b)) return false;
        rgb = (r, g, b);
        return true;
    }
}
