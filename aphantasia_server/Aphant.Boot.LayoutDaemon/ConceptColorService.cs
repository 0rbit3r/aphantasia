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

        var contributions = new Dictionary<string, List<(string Color, int Size)>>();
        foreach (var row in data)
        {
            var tag = row.ConceptTag;
            while (true)
            {
                if (!contributions.TryGetValue(tag, out var list))
                    contributions[tag] = list = [];
                list.Add((row.Color, row.SizeMultiplier));
                var lastIdx = tag.LastIndexOf('_');
                if (lastIdx <= 0) break;
                tag = tag[..lastIdx];
            }
        }

        var blended = contributions
            .ToDictionary(kvp => kvp.Key, kvp => BlendColors(kvp.Value));

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
        return EnsureReadableOnBlack((r / totalWeight) / 255.0, (g / totalWeight) / 255.0, (b / totalWeight) / 255.0);
    }

    private static string EnsureReadableOnBlack(double r, double g, double b)
    {
        var max = Math.Max(r, Math.Max(g, b));
        var min = Math.Min(r, Math.Min(g, b));
        var l = (max + min) / 2.0;
        double h, s;

        if (max == min)
        {
            h = s = 0;
        }
        else
        {
            var d = max - min;
            s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);
            h = max switch
            {
                _ when max == r => (g - b) / d + (g < b ? 6 : 0),
                _ when max == g => (b - r) / d + 2,
                _ => (r - g) / d + 4,
            };
            h /= 6.0;
        }

        const double minL = 0.60;
        l = Math.Max(l, minL);

        if (s == 0)
        {
            var v = (int)(l * 255);
            return $"#{v:X2}{v:X2}{v:X2}";
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        var rOut = (int)(HueToRgb(p, q, h + 1.0 / 3) * 255);
        var gOut = (int)(HueToRgb(p, q, h) * 255);
        var bOut = (int)(HueToRgb(p, q, h - 1.0 / 3) * 255);
        return $"#{rOut:X2}{gOut:X2}{bOut:X2}";

        static double HueToRgb(double p, double q, double t)
        {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1.0 / 6) return p + (q - p) * 6 * t;
            if (t < 1.0 / 2) return q;
            if (t < 2.0 / 3) return p + (q - p) * (2.0 / 3 - t) * 6;
            return p;
        }
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
