using Aphant.Core.Contract.Logic;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Microsoft.Extensions.Options;

namespace Aphant.Impl.FdlLayout;

public class ChatFdlLayoutService(IOptions<ChatFdlLayoutOptions> options) : IChatLayoutContract
{
    private readonly ChatFdlLayoutOptions _opts = options.Value;

    public Task<Result<List<ChatMessage>>> LayoutChatMessages(List<ChatMessage> messages, int iterations = 1)
    {
        if (messages.Count == 0)
            return Task.FromResult<Result<List<ChatMessage>>>(messages);

        var nodes = messages.Select(m => new GraphNode
        {
            Id = m.Id,
            Links = m.ParentId.HasValue ? [m.ParentId.Value] : [],
            BackLinks = [],
            Size = 0,
            Radius = (int)_opts.BaseRadius,
            PositionX = m.X != 0 ? m.X : Random.Shared.NextDouble() - 0.5,
            PositionY = m.Y != 0 ? m.Y : Random.Shared.NextDouble() - 0.5,
        }).ToList();

        for (int i = 0; i < iterations; i++)
            SimulateOneFrame(nodes);

        var nodeMap = nodes.ToDictionary(n => n.Id);
        foreach (var msg in messages)
        {
            if (nodeMap.TryGetValue(msg.Id, out var node))
            {
                msg.X = node.PositionX;
                msg.Y = node.PositionY;
            }
        }

        return Task.FromResult<Result<List<ChatMessage>>>(messages);
    }

    private void SimulateOneFrame(List<GraphNode> nodes)
    {
        for (var i = 0; i < nodes.Count; i++)
        {
            var source = nodes[i];
            for (var j = 0; j < i; j++)
            {
                var target = nodes[j];
                var borderDist = GetBorderDistance(source, target);

                if (source.Links.Contains(target.Id) || target.Links.Contains(source.Id))
                    PullOrPushToIdealDistance(source, target);
                else if (borderDist < _opts.PushThreshold)
                    PushApart(source, target, borderDist);
            }

            if (_opts.GravityEnabled)
                ApplyGravity(source);
        }

        foreach (var node in nodes)
        {
            if (Math.Abs(node.MomentumX) < Math.Abs(node.ForcesX))
                node.MomentumX = Math.Abs(node.MomentumX) * Math.Sign(node.ForcesX);
            if (Math.Abs(node.MomentumY) < Math.Abs(node.ForcesY))
                node.MomentumY = Math.Abs(node.MomentumY) * Math.Sign(node.ForcesY);

            node.MomentumX = (node.MomentumX + node.ForcesX) / _opts.DampeningRate;
            node.MomentumY = (node.MomentumY + node.ForcesY) / _opts.DampeningRate;

            var speed = Math.Sqrt(node.MomentumX * node.MomentumX + node.MomentumY * node.MomentumY);
            if (speed > _opts.MaxMovementSpeed)
            {
                node.MomentumX = _opts.MaxMovementSpeed * node.MomentumX / speed;
                node.MomentumY = _opts.MaxMovementSpeed * node.MomentumY / speed;
            }

            node.PositionX += node.MomentumX;
            node.PositionY += node.MomentumY;

            node.ForcesX /= _opts.DampeningRate;
            node.ForcesY /= _opts.DampeningRate;
        }
    }

    private void PushApart(GraphNode a, GraphNode b, double borderDist)
    {
        var dx = b.PositionX - a.PositionX;
        var dy = b.PositionY - a.PositionY;
        var centerDist = GetCenterDistance(a, b);

        var force = PushForce(borderDist) - PushForce(_opts.PushThreshold);

        a.ForcesX -= dx / centerDist * force;
        a.ForcesY -= dy / centerDist * force;
        b.ForcesX += dx / centerDist * force;
        b.ForcesY += dy / centerDist * force;
    }

    private void PullOrPushToIdealDistance(GraphNode a, GraphNode b)
    {
        var dx = b.PositionX - a.PositionX;
        var dy = b.PositionY - a.PositionY;
        var centerDist = GetCenterDistance(a, b);
        var borderDist = GetBorderDistance(a, b);

        var raw = _opts.PullForce * (borderDist - _opts.IdealEdgeLength);
        var clamped = Math.Max(-_opts.MaxPullForce, Math.Min(_opts.MaxPullForce, raw));
        var force = Math.Sign(clamped) < 0 ? clamped / _opts.EdgeCompresibilityFactor : clamped;

        a.ForcesX += dx / centerDist * force;
        a.ForcesY += dy / centerDist * force;
        b.ForcesX -= dx / centerDist * force;
        b.ForcesY -= dy / centerDist * force;
    }

    private void ApplyGravity(GraphNode node)
    {
        var dx = node.PositionX;
        var dy = node.PositionY;
        var dist = Math.Max(Math.Sqrt(dx * dx + dy * dy), 0.01);

        double force;
        if (dist < _opts.GravityFreeRadius)
            force = -_opts.GravityForce / (dist - _opts.GravityFreeRadius);
        else
            force = _opts.MaxGravityForce;

        node.ForcesX -= force * (dx / dist);
        node.ForcesY -= force * (dy / dist);
    }

    private double PushForce(double borderDist)
    {
        if (borderDist <= 0) return 0;
        return Math.Min(_opts.MaxPushForce, _opts.PushForce / Math.Sqrt(borderDist));
    }

    private double GetBorderDistance(GraphNode a, GraphNode b)
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
}
