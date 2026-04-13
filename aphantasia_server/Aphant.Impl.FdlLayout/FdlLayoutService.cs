using Aphant.Core.Contract;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Microsoft.Extensions.Options;

namespace Aphant.Impl.FdlLayout;

public class FdlLayoutService : ILayoutLogicContract
{
    private readonly FdlLayoutOptions _options;

    public FdlLayoutService(IOptions<FdlLayoutOptions> options)
    {
        _options = options.Value;
    }

    public async Task<Result<List<ThoughtNode>>> LayoutThoughts(List<ThoughtNode> thoughts, int iterations = 1)
    {
        List<GraphNode> nodes = thoughts.Select(t => new GraphNode
        {
            Id = t.Id,
            Links = t.Links.ToList(),
            BackLinks = t.Replies.ToList(),
            Size = t.Size,
            Radius = GetRadius(t.Size),
            PositionX = t.X != 0 ? t.X : Random.Shared.NextDouble() - 0.5,
            PositionY = t.Y != 0 ? t.Y : Random.Shared.NextDouble() - 0.5,
            MomentumX = 0,
            MomentumY = 0,
            ForcesX = 0,
            ForcesY = 0,
        }).ToList();

        for (int i = 0; i < iterations; i++)
        {
            SimulateOneFrame(nodes);
        }

        return thoughts.Select(t =>
        {
            var node = nodes.SingleOrDefault(n => n.Id == t.Id);
            if (node is not null)
            {
                t.X = node.PositionX;
                t.Y = node.PositionY;
            }
            return t;
        }).ToList();
    }

    private void SimulateOneFrame(List<GraphNode> nodes)
    {
        for (var i = 0; i < nodes.Count; i++)
        {
            var sourceThought = nodes[i];
            for (var j = 0; j < i; j++)
            {
                var targetThought = nodes[j];
                var borderDistance = GetBorderDistance(sourceThought, targetThought);

                if (sourceThought.Links.Contains(targetThought.Id))
                {
                    PullOrPushConnectedToIdealDistance(sourceThought, targetThought);
                }


                else if (borderDistance < _options.PushThreshold)
                {
                    PushUnconnected(sourceThought, targetThought, _options);
                }
            }
            if (_options.GravityEnabled)
            {
                GravityPull(sourceThought, _options);
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

            node.MomentumX /= _options.DampeningRate;
            node.MomentumY /= _options.DampeningRate;

            var totalMomentum = Math.Sqrt(Math.Pow(node.MomentumX, 2) + Math.Pow(node.MomentumY, 2));
            if (Math.Abs(totalMomentum) > _options.MaxMovementSpeed)
            {
                node.MomentumX = _options.MaxMovementSpeed * (node.MomentumX / totalMomentum);
                node.MomentumY = _options.MaxMovementSpeed * (node.MomentumY / totalMomentum);
            }

            node.PositionX += node.MomentumX;
            node.PositionY += node.MomentumY;

            node.ForcesX /= _options.DampeningRate;
            node.ForcesY /= _options.DampeningRate;
        }
    }

    private void PushUnconnected(GraphNode sourceThought, GraphNode targetThought, FdlLayoutOptions opts)
    {
        var dx = targetThought.PositionX - sourceThought.PositionX;
        var dy = targetThought.PositionY - sourceThought.PositionY;
        var centerDistance = GetCenterDistance(sourceThought, targetThought);
        var borderDistance = GetBorderDistance(sourceThought, targetThought);

        var pushForceResult = PushForce(opts.PushThreshold, opts);

        var force = PushForce(borderDistance, opts) - pushForceResult;

        var nodeMassMultiplier = opts.NodeMassOn
            ? Math.Min(Math.Max(targetThought.Radius / sourceThought.Radius, opts.MinMassDifferencePushForceMultiplier), opts.MaxMassDifferencePushForceMultiplier)
            : 1;

        sourceThought.ForcesX -= dx / centerDistance * force * nodeMassMultiplier;
        sourceThought.ForcesY -= dy / centerDistance * force * nodeMassMultiplier;
        targetThought.ForcesX += dx / centerDistance * force / nodeMassMultiplier;
        targetThought.ForcesY += dy / centerDistance * force / nodeMassMultiplier;
    }

    private void PullOrPushConnectedToIdealDistance(GraphNode source, GraphNode target)
    {
        var dx = target.PositionX - source.PositionX;
        var dy = target.PositionY - source.PositionY;

        var centerDistance = GetCenterDistance(source, target);
        var borderDistance = GetBorderDistance(source, target);

        var idealDistanceAdjustedByFactors = _options.IdealEdgeLength
            * Math.Max(target.Size * _options.IdealDistSizeMultiplier, 1);

        var force = PullForce(borderDistance, idealDistanceAdjustedByFactors, _options)
            / BacklinksNumberForceDivisor(target.BackLinks.Count);

        var nodeMassMultiplier = _options.NodeMassOn
            ? Math.Min(Math.Max(target.Radius / source.Radius, _options.MinMassDifferencePullForceMultiplier), _options.MaxMassDifferencePullForceMultiplier)
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

    private void GravityPull(GraphNode thought, FdlLayoutOptions opts)
    {
        var dx = thought.PositionX;
        var dy = thought.PositionY;
        var centerDistance = Math.Max(Math.Sqrt(dx * dx + dy * dy), 0.01);

        var force = GravityForce(centerDistance, opts);

        var forceX = force * (dx / centerDistance);
        var forceY = force * (dy / centerDistance);
        thought.ForcesX -= forceX; //why did i have to change this to minus?????
        thought.ForcesY -= forceY;
    }


    private double GetBorderDistance(GraphNode thought1, GraphNode thought2)
    {
        var centerDistance = GetCenterDistance(thought1, thought2);
        var borderDistance = centerDistance - thought1.Radius - thought2.Radius;
        return borderDistance < 0.01 ? 0.01 : borderDistance;
    }

    private double GetCenterDistance(GraphNode thought1, GraphNode thought2)
    {
        var x1 = thought1.PositionX;
        var y1 = thought1.PositionY;
        var x2 = thought2.PositionX;
        var y2 = thought2.PositionY;

        var dist = Math.Sqrt(Math.Pow(x1 - x2, 2) + Math.Pow(y1 - y2, 2));

        // prevents division by zero (?)
        return dist < 0.01 ? 0.01 : dist;
    }

    /// <summary>
    /// Calculates a push force based on the distance to a border.
    /// </summary>
    private static double PushForce(double borderDist, FdlLayoutOptions opts)
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
    private static double PullForce(double borderDist, double idealDistance, FdlLayoutOptions opts)
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
    private static double GravityForce(double centerDistance, FdlLayoutOptions opts)
    {
        if (centerDistance < opts.GravityFreeRadius)
        {
            return -opts.GravityForce / (centerDistance - opts.GravityFreeRadius);
        }
        else
        {
            return opts.MaxGravityForce;
        }
    }

    /// <summary>
    /// Provides a divisor to dampen activation based on number of backlinks.
    /// </summary>
    private static double BacklinksNumberForceDivisor(int bl)
    {
        if (bl < 3)
        {
            return 1;
        }
        return 1 + bl / 10;
    }

    private int GetRadius(int repliesNum)
    {
        // return (int)Math.Min(opts.BaseRadius * Math.Pow(opts.ReferenceRadiusMultiplier, repliesNum), opts.MaxRadius);
        // return (int)(Math.Log(repliesNum + 10) * 700 - 1610 + opts.BaseRadius);
        return (int)(Math.Log(((double)repliesNum + 100) / 100) * 3000 + _options.BaseRadius);
    }
}
