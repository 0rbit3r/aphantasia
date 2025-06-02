using Afantazie.Core.Model.Results;
using Afantazie.Data.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Drawing;
using Microsoft.Extensions.Options;
using Afantazie.Service.Interface.GraphLayout;

namespace Afantazie.Service.GraphLayout;

public class GraphLayoutService(
    DataContextProvider _dataContextProvider,
    ILogger<GraphLayoutService> _log,
    IOptionsMonitor<FdlParametersOptions> _fdlParams
    ) : IGraphLayoutService
{

    public async Task<Result> RandomizePositionsAsync()
    {
        using var db = _dataContextProvider.GetDataContext();

        var allthoughts = db.Thoughts.ToList();

        var r = new Random();

        foreach (var thought in allthoughts)
        {
            thought.PositionX = r.NextDouble() * 100000 - 50000;
            thought.PositionY = r.NextDouble() * 100000 - 50000;
        }

        await db.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> RunFDLAsync(int frames)
    {
        var opts = _fdlParams.CurrentValue;

        // _log.LogInformation("PushThreshold: {thresh}", opts.PushThreshold);

        _log.LogInformation("Running FDL...");
        using var db = _dataContextProvider.GetDataContext();

        var allthoughts = db.Thoughts.Include(t => t.Links).Include(t => t.Backlinks).ToList();

        var thoughtNodes = allthoughts.Select(t => new ThoughtNode
        {
            Id = t.Id,
            Links = t.Links.Select(l => l.TargetId).ToList(),
            BackLinks = t.Backlinks.Select(b => b.SourceId).ToList(),
            Size = t.SizeMultiplier,
            ForcesX = 0,
            ForcesY = 0,
            PositionX = t.PositionX ?? 0,
            PositionY = t.PositionY ?? 0, //todo
            Radius = (int)Math.Min(opts.BaseRadius * Math.Pow(opts.ReferenceRadiusMultiplier, t.SizeMultiplier), opts.MaxRadius),
        }).ToList();

        for (int frame = 0; frame < frames; frame++)
        {
            if (frame % 10 == 0) _log.LogDebug($"   {frame} / {frames}");
            SimulateOneFrame(thoughtNodes, opts);
        }

        for (int i = 0; i < thoughtNodes.Count; i++)
        {
            var node = thoughtNodes[i];
            var thought = allthoughts[i];
            if (node.Id != thought.Id)
            {
                throw new Exception("The two arays are not synced! Aborting.");
            }
            thought.PositionX = node.PositionX;
            thought.PositionY = node.PositionY;
        }

        await db.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> PrintImage()
    {
        _log.LogInformation("Saving layout image: {img}", $"{DateTime.Now:yyyy-MM-dd_HHmmss}.png");

        using var db = _dataContextProvider.GetDataContext();

        var thoughtsDict = db.Thoughts.Include(t => t.Author).Include(t => t.Links).ToDictionary(t => t.Id);

        using var image = new Image<Rgba32>(_fdlParams.CurrentValue.Resolution, _fdlParams.CurrentValue.Resolution, Color.White);

        // Fill background with black
        image.Mutate(ctx => ctx.Fill(Color.Black));

        foreach (var thought in db.Thoughts.Include(t => t.Author).Include(t => t.Links))
        {
            var resolution = _fdlParams.CurrentValue.Resolution;
            var scale = _fdlParams.CurrentValue.Scale;
            var viewportX = _fdlParams.CurrentValue.ViewportPositionX;
            var viewportY = _fdlParams.CurrentValue.ViewportPositionY;


            var center = resolution / 2.0;

            var x = center + (thought.PositionX - viewportX) * scale;
            var y = center - (thought.PositionY - viewportY) * scale;

            if (x is null || y is null) continue;

            var radius = (float)(_fdlParams.CurrentValue.BaseRadius
                * Math.Pow(_fdlParams.CurrentValue.ReferenceRadiusMultiplier, thought.SizeMultiplier)
                * _fdlParams.CurrentValue.Scale);
            var color = ParseHexColor(thought.Author.Color);

            // Draw a filled circle at the position
            var circle = new EllipsePolygon((float)x, (float)y,
                Math.Min(radius, (float)(_fdlParams.CurrentValue.MaxRadius * _fdlParams.CurrentValue.Scale)));
            image.Mutate(ctx => ctx.Fill(color, circle));

            var links = thought.Links.Select(l => l.TargetId);
            foreach (var link in links)
            {
                if (!thoughtsDict.TryGetValue(link, out var targetThought))
                    continue;

                var targetX = center + (targetThought.PositionX - viewportX) * scale;
                var targetY = center - (targetThought.PositionY - viewportY) * scale;
                if (targetX is null || targetY is null) continue;

                // Draw line between source and target
                image.Mutate(ctx => ctx.DrawLine(
                    new DrawingOptions
                    {
                        GraphicsOptions = new GraphicsOptions
                        {
                            Antialias = true,
                            BlendPercentage = 1f,
                            AlphaCompositionMode = PixelAlphaCompositionMode.SrcOver
                        }
                    },
                Color.ParseHex(targetThought.Author.Color).WithAlpha(0.3f),
                1f,
                new PointF((float)x, (float)y), new PointF((float)targetX, (float)targetY)));
            }
        }

        image.Mutate(img => img.Flip(FlipMode.Vertical));

        await image.SaveAsPngAsync($"{_fdlParams.CurrentValue.LayoutPNGsPath}{DateTime.Now:yyyy-MM-dd_HHmmss}.png");

        return Result.Success();
    }

    // Helper to parse hex color string (e.g., "#FF00FF")
    private static Color ParseHexColor(string hex)
    {
        if (string.IsNullOrWhiteSpace(hex))
            return Color.White;

        try
        {
            return Color.ParseHex(hex.TrimStart('#'));
        }
        catch
        {
            return Color.White;
        }
    }


    private void SimulateOneFrame(List<ThoughtNode> nodes, FdlParametersOptions opts)
    {
        for (var i = 0; i < nodes.Count; i++)
        {
            var sourceThought = nodes[i];
            // handleOutOfBounds(sourceThought);
            // if (!graphControlsState.noBorders) {
            //     handleOutOfBorders(sourceThought);
            // }
            for (var j = 0; j < i; j++)
            {
                var targetThought = nodes[j];
                if (sourceThought.Id > targetThought.Id)
                { //This relies on the fact that thoughts can only reference older ones... and sorted array...
                    var borderDistance = GetBorderDistance(sourceThought, targetThought);

                    if (sourceThought.Links.Contains(targetThought.Id))
                    {
                        PullOrPushConnectedToIdealDistance(sourceThought, targetThought, opts);
                    }


                    else if (borderDistance < opts.PushThreshold)
                    {
                        PushUnconnected(sourceThought, targetThought, opts);
                    }
                }
                if (opts.GravityEnabled)
                {
                    GravityPull(sourceThought, opts);
                }
            }
        }


        foreach (var node in nodes)
        {

            if (Math.Abs(node.MomentumX) < Math.Abs(node.ForcesX))
            {
                node.MomentumX = Math.Abs(node.MomentumX) * Math.Sign(node.ForcesX);
            }
            if (Math.Abs(node.MomentumY) < Math.Abs(node.ForcesY))
            {
                node.MomentumY = Math.Abs(node.MomentumY) * Math.Sign(node.ForcesY);
            }

            node.MomentumX += node.ForcesX;
            node.MomentumY += node.ForcesY;

            // console.log("frameAdjustedDampeningRate: ", frameAdjustedDampeningRate);

            node.MomentumX /= opts.DampeningRate;
            node.MomentumY /= opts.DampeningRate;

            // node.momentum.x = Math.min(node.momentum.x, MAX_MOMENTUM);
            // node.momentum.y = Math.min(node.momentum.y, MAX_MOMENTUM);

            var totalMomentum = Math.Sqrt(Math.Pow(node.MomentumX, 2) + Math.Pow(node.MomentumY, 2));
            if (Math.Abs(totalMomentum) > opts.MaxMovementSpeed)
            {
                node.MomentumX = opts.MaxMovementSpeed * (node.MomentumX / totalMomentum);
                node.MomentumY = opts.MaxMovementSpeed * (node.MomentumY / totalMomentum);
            }

            node.PositionX += node.MomentumX;
            node.PositionY += node.MomentumY;

            node.ForcesX /= opts.DampeningRate;
            node.ForcesY /= opts.DampeningRate;
        }
    }

    private void PushUnconnected(ThoughtNode sourceThought, ThoughtNode targetThought, FdlParametersOptions opts)
    {
        var dx = targetThought.PositionX - sourceThought.PositionX;
        var dy = targetThought.PositionY - sourceThought.PositionY;
        var centerDistance = GetCenterDistance(sourceThought, targetThought);
        var borderDistance = GetBorderDistance(sourceThought, targetThought);

        var pushForceResult = PushForce(opts.PushThreshold, opts); //this might be a bit inefficient and weird but hey... it works to eliminate the noncontinuity of the push force at the edge

        var force = PushForce(borderDistance, opts) - pushForceResult;

        var nodeMassMultiplier = opts.NodeMassOn
            ? Math.Min(Math.Max(targetThought.Radius / sourceThought.Radius, opts.MinMassDifferencePushForceMultiplier), opts.MaxMassDifferencePushForceMultiplier)
            : 1;

        sourceThought.ForcesX -= dx / centerDistance * force
            * nodeMassMultiplier;

        sourceThought.ForcesY -= dy / centerDistance * force
            * nodeMassMultiplier;
        targetThought.ForcesX += dx / centerDistance * force
            / nodeMassMultiplier;
        targetThought.ForcesY += dy / centerDistance * force
            / nodeMassMultiplier;
    }

    private void PullOrPushConnectedToIdealDistance(ThoughtNode source, ThoughtNode target, FdlParametersOptions opts)
    {
        var dx = target.PositionX - source.PositionX;
        var dy = target.PositionY - source.PositionY;

        var centerDistance = GetCenterDistance(source, target);
        var borderDistance = GetBorderDistance(source, target);

        var idealDistanceAdjustedByFactors = opts.IdealEdgeLength
            * Math.Max(target.Size * opts.IdealDistSizeMultiplier, 1);

        var force = PullForce(borderDistance, idealDistanceAdjustedByFactors, opts)
            / BacklinksNumberForceDivisor(target.BackLinks.Count);

        var nodeMassMultiplier = opts.NodeMassOn
            ? Math.Min(Math.Max(target.Radius / source.Radius, opts.MinMassDifferencePullForceMultiplier), opts.MaxMassDifferencePullForceMultiplier)
            : 1;

        // Apply forces
        source.ForcesX += dx / centerDistance * force
            * nodeMassMultiplier;
        source.ForcesY += dy / centerDistance * force
            * nodeMassMultiplier;
        target.ForcesX -= dx / centerDistance * force
            / nodeMassMultiplier;
        target.ForcesY -= dy / centerDistance * force
            / nodeMassMultiplier;
    }

    private void GravityPull(ThoughtNode thought, FdlParametersOptions opts)
    {
        var dx = thought.PositionX;
        var dy = thought.PositionY;
        var centerDistance = Math.Sqrt(dx * dx + dy * dy);

        // if (centerDistance < opts.GravityFreeRadius)
        // {
        //     return;
        // }


        var force = GravityForce(centerDistance, opts);

        var forceX = force * (dx / centerDistance);
        var forceY = force * (dy / centerDistance);
        thought.ForcesX -= forceX; //why did i have to change this to minus?????
        thought.ForcesY -= forceY;
    }


    private double GetBorderDistance(ThoughtNode thought1, ThoughtNode thought2)
    {
        var x1 = thought1.PositionX;
        var y1 = thought1.PositionY;
        var x2 = thought2.PositionX;
        var y2 = thought2.PositionY;
        var centerDistance = Math.Sqrt(Math.Pow(Math.Abs(x1 - x2), 2) + Math.Pow(Math.Abs(y1 - y2), 2));
        var borderDistance = centerDistance - thought1.Radius - thought2.Radius;
        // if (borderDistance > centerDistance) {
        //     return borderDistance - 
        // }

        return borderDistance;
    }

    private double GetCenterDistance(ThoughtNode thought1, ThoughtNode thought2)
    {
        var x1 = thought1.PositionX;
        var y1 = thought1.PositionY;
        var x2 = thought2.PositionX;
        var y2 = thought2.PositionY;

        var dist = Math.Sqrt(Math.Pow(Math.Abs(x1 - x2), 2) + Math.Pow(Math.Abs(y1 - y2), 2));

        // prevents division by zero (?)
        return dist == 0 ? 0.01 : dist;
    }

    /// <summary>
    /// Calculates a push force based on the distance to a border.
    /// </summary>
    public static double PushForce(double borderDist, FdlParametersOptions opts)
    {
        if (borderDist == 0)
            return 0;

        if (borderDist < 0)
            return opts.AllowOverlap ? 0 : -borderDist;

        double computed = opts.PushForce / Math.Sqrt(borderDist);
        return Math.Min(opts.MaxPushForce, computed);
    }

    /// <summary>
    /// Calculates a pull force to enforce an ideal distance.
    /// </summary>
    public static double PullForce(double borderDist, double idealDistance, FdlParametersOptions opts)
    {
        if (borderDist < 0)
            return -opts.MaxPullForce;

        double computed = opts.PullForce * (borderDist - idealDistance);
        double limited = Math.Max(-opts.MaxPullForce, Math.Min(opts.MaxPullForce, computed));

        double finalForce = Math.Sign(limited) < 0
            ? limited / opts.EdgeCompresibilityFactor
            : limited;

        return finalForce;
    }

    /// <summary>
    /// Calculates a gravitational force pulling towards the center.
    /// </summary>
    public static double GravityForce(double centerDistance, FdlParametersOptions opts)
    {
        if (centerDistance < opts.GravityFreeRadius)
        {
            // var t = centerDistance - opts.GravityFreeRadius;
            // return opts.GravityForce / (1 + Math.Exp(-0.0005 * t));

            //return opts.GravityForce * Math.Log(centerDistance - opts.GravityFreeRadius + 1);

            return -opts.GravityForce / (centerDistance - opts.GravityFreeRadius) - opts.GravityForce / opts.GravityFreeRadius;
        }
        else
        {
            return opts.MaxGravityForce;
        }
    }

    /// <summary>
    /// Provides a divisor to dampen activation based on number of backlinks.
    /// </summary>
    public static double BacklinksNumberForceDivisor(int bl)
    {
        if (bl < 3)
        {
            return 1;
        }
        return 1 + bl / 10;
    }
}

internal class ThoughtNode
{

    public int Id;
    public double PositionX;
    public double PositionY;
    public int Size;
    public int Radius;
    public List<int> Links = new();
    public List<int> BackLinks = new();
    public double ForcesX;
    public double ForcesY;
    public double MomentumX;
    public double MomentumY;
}