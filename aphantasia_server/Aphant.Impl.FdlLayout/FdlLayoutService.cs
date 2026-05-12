using Aphant.Core.Contract;
using Aphant.Core.Dto;

namespace Aphant.Impl.FdlLayout;

public partial class FdlLayoutService : ILayoutLogicContract
{
    public List<LayoutNode> LayoutNodes(List<LayoutNode> nodes, FdlLayoutOptions options, int iterations = 1)
    {
        var graphNodes = nodes.Select(n => new GraphNode
        {
            Id = n.Id,
            Links = n.Links.ToList(),
            BackLinks = n.BackLinks.ToList(),
            Size = n.Size,
            Radius = GetRadius(n.Size, options),
            PositionX = n.X != 0 ? n.X : Random.Shared.NextDouble() - 0.5,
            PositionY = n.Y != 0 ? n.Y : Random.Shared.NextDouble() - 0.5,
        }).ToList();

        for (int i = 0; i < iterations; i++)
            SimulateOneFrame(graphNodes, options);

        var graphNodeMap = graphNodes.ToDictionary(g => g.Id);
        foreach (var node in nodes)
        {
            if (graphNodeMap.TryGetValue(node.Id, out var gn))
            {
                node.X = gn.PositionX;
                node.Y = gn.PositionY;
            }
        }

        return nodes;
    }

    private static void SimulateOneFrame(List<GraphNode> nodes, FdlLayoutOptions options)
    {
        for (var i = 0; i < nodes.Count; i++)
        {
            var source = nodes[i];
            for (var j = 0; j < i; j++)
            {
                var target = nodes[j];
                var borderDistance = GetBorderDistance(source, target);

                if (source.Links.Contains(target.Id) || target.Links.Contains(source.Id))
                    PullOrPushConnectedToIdealDistance(source, target, options);
                else if (borderDistance < options.PushThreshold)
                    PushUnconnected(source, target, options);
            }

            if (options.GravityEnabled)
                GravityPull(source, options);
        }

        foreach (var node in nodes)
        {
            if (Math.Abs(node.MomentumX) < Math.Abs(node.ForcesX))
                node.MomentumX = Math.Abs(node.MomentumX) * Math.Sign(node.ForcesX);
            if (Math.Abs(node.MomentumY) < Math.Abs(node.ForcesY))
                node.MomentumY = Math.Abs(node.MomentumY) * Math.Sign(node.ForcesY);

            node.MomentumX += node.ForcesX;
            node.MomentumY += node.ForcesY;

            node.MomentumX /= options.DampeningRate;
            node.MomentumY /= options.DampeningRate;

            var totalMomentum = Math.Sqrt(Math.Pow(node.MomentumX, 2) + Math.Pow(node.MomentumY, 2));
            if (Math.Abs(totalMomentum) > options.MaxMovementSpeed)
            {
                node.MomentumX = options.MaxMovementSpeed * (node.MomentumX / totalMomentum);
                node.MomentumY = options.MaxMovementSpeed * (node.MomentumY / totalMomentum);
            }

            node.PositionX += node.MomentumX;
            node.PositionY += node.MomentumY;

            node.ForcesX /= options.DampeningRate;
            node.ForcesY /= options.DampeningRate;
        }
    }

    private static void PushUnconnected(GraphNode source, GraphNode target, FdlLayoutOptions options)
    {
        var dx = target.PositionX - source.PositionX;
        var dy = target.PositionY - source.PositionY;
        var centerDistance = GetCenterDistance(source, target);
        var borderDistance = GetBorderDistance(source, target);

        var force = PushForce(borderDistance, options) - PushForce(options.PushThreshold, options);

        var nodeMassMultiplier = options.NodeMassOn
            ? Math.Min(Math.Max(target.Radius / source.Radius, options.MinMassDifferencePushForceMultiplier), options.MaxMassDifferencePushForceMultiplier)
            : 1;

        source.ForcesX -= dx / centerDistance * force * nodeMassMultiplier;
        source.ForcesY -= dy / centerDistance * force * nodeMassMultiplier;
        target.ForcesX += dx / centerDistance * force * nodeMassMultiplier;
        target.ForcesY += dy / centerDistance * force * nodeMassMultiplier;
    }

    private static void PullOrPushConnectedToIdealDistance(GraphNode source, GraphNode target, FdlLayoutOptions options)
    {
        var dx = target.PositionX - source.PositionX;
        var dy = target.PositionY - source.PositionY;

        var centerDistance = GetCenterDistance(source, target);
        var borderDistance = GetBorderDistance(source, target);

        var idealDistanceAdjustedByFactors = options.IdealEdgeLength
            * Math.Max(target.Size * options.IdealDistSizeMultiplier, 1);

        var force = PullForce(borderDistance, idealDistanceAdjustedByFactors, options)
            / BacklinksNumberForceDivisor(target.BackLinks.Count);

        var nodeMassMultiplier = options.NodeMassOn
            ? Math.Min(Math.Max(target.Radius / source.Radius, options.MinMassDifferencePullForceMultiplier), options.MaxMassDifferencePullForceMultiplier)
            : 1;

        var downflowSign = source.Links.Contains(target.Id) ? -1.0 : 1.0;
        var downflowY = options.DownflowEnabled ? options.DownflowForce * nodeMassMultiplier * downflowSign : 0;
        source.ForcesX += dx / centerDistance * force * nodeMassMultiplier;
        source.ForcesY += dy / centerDistance * force * nodeMassMultiplier - downflowY;
        target.ForcesX -= dx / centerDistance * force * nodeMassMultiplier;
        target.ForcesY -= dy / centerDistance * force * nodeMassMultiplier - downflowY;
    }

    private static void GravityPull(GraphNode node, FdlLayoutOptions options)
    {
        var dx = node.PositionX;
        var dy = node.PositionY;
        var centerDistance = Math.Max(Math.Sqrt(dx * dx + dy * dy), 0.01);

        var force = GravityForce(centerDistance, options);

        node.ForcesX -= force * (dx / centerDistance);
        node.ForcesY -= force * (dy / centerDistance);
    }

    private static double GetBorderDistance(GraphNode a, GraphNode b)
    {
        var d = GetCenterDistance(a, b) - a.Radius - b.Radius;
        return d < 0.01 ? 0.01 : d;
    }

    private static double GetCenterDistance(GraphNode a, GraphNode b)
    {
        var dx = a.PositionX - b.PositionX;
        var dy = a.PositionY - b.PositionY;
        var d = Math.Sqrt(dx * dx + dy * dy);
        return d < 0.01 ? 0.01 : d;
    }

    private static double PushForce(double borderDist, FdlLayoutOptions options)
    {
        if (borderDist == 0) return 0;
        if (borderDist < 0) return options.AllowOverlap ? 0 : -borderDist;
        return Math.Min(options.MaxPushForce, options.PushForce / Math.Sqrt(borderDist));
    }

    private static double PullForce(double borderDist, double idealDistance, FdlLayoutOptions options)
    {
        if (borderDist < 0) return -options.MaxPullForce;
        double computed = options.PullForce * (borderDist - idealDistance);
        double limited = Math.Max(-options.MaxPullForce, Math.Min(options.MaxPullForce, computed));
        return Math.Sign(limited) < 0 ? limited / options.EdgeCompresibilityFactor : limited;
    }

    private static double GravityForce(double centerDistance, FdlLayoutOptions options)
    {
        if (centerDistance < options.GravityFreeRadius)
            return -options.GravityForce / (centerDistance - options.GravityFreeRadius);
        return options.MaxGravityForce;
    }

    private static double BacklinksNumberForceDivisor(int bl)
    {
        return bl < 3 ? 1 : 1 + bl / 10.0;
    }

    private static int GetRadius(int size, FdlLayoutOptions options)
    {
        return (int)(Math.Log(((double)size + 100) / 100) * 3000 + options.BaseRadius);
    }
}
