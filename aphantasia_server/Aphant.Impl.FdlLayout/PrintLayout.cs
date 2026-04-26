using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace Aphant.Impl.FdlLayout;

public partial class FdlLayoutService
{
    public async Task<Result> PrintLayout(string path, int? epoch)
    {
        var epochResult = await _epochData.GetEpochAsync(epoch);
        if (!epochResult.IsSuccess) return epochResult.Error!;

        var thoughts = epochResult.Payload!.Thoughts;
        var thoughtsDict = thoughts.ToDictionary(t => t.Id);

        var resolution = _options.Resolution;
        var scale = _options.Scale;
        var viewportX = _options.ViewportPositionX;
        var viewportY = _options.ViewportPositionY;
        var center = resolution / 2.0;

        using var image = new Image<Rgba32>(resolution, resolution);
        image.Mutate(ctx => ctx.Fill(Color.Black));

        foreach (var thought in thoughts)
        {
            var cx = (float)(center + (thought.X - viewportX) * scale);
            var cy = (float)(center - (thought.Y - viewportY) * scale);
            var r = (float)Math.Min(GetRadius(thought.Size) * scale, _options.MaxRadius * scale);

            var shape = GetShape(cx, cy, r, thought.Shape);
            image.Mutate(ctx => ctx.Fill(Color.ParseHex(thought.Color), shape));

            foreach (var linkId in thought.Links)
            {
                if (!thoughtsDict.TryGetValue(linkId, out var target)) continue;

                var targetCx = (float)(center + (target.X - viewportX) * scale);
                var targetCy = (float)(center - (target.Y - viewportY) * scale);

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
                    Color.ParseHex(target.Color).WithAlpha(0.3f),
                    3f,
                    new PointF(cx, cy),
                    new PointF(targetCx, targetCy)));
            }
        }

        image.Mutate(img => img.Flip(FlipMode.Vertical));
        await image.SaveAsPngAsync(path);

        return Result.Success();
    }

    // Shape coordinates use (cx + dx, cy - dy) to negate Pixi's Y deltas — the image is
    // flipped vertically at the end, so negating here ensures correct orientation in the final PNG.
    private static IPath GetShape(float cx, float cy, float r, ThoughtShape shape) => shape switch
    {
        ThoughtShape.Circle           => DrawCircle(cx, cy, r),
        ThoughtShape.Square           => DrawSquare(cx, cy, r),
        ThoughtShape.Diamond          => DrawDiamond(cx, cy, r),
        ThoughtShape.Triangle         => DrawTriangle(cx, cy, r),
        ThoughtShape.ReversedTriangle => DrawReversedTriangle(cx, cy, r),
        ThoughtShape.Cross            => DrawCross(cx, cy, r),
        ThoughtShape.Heart            => DrawHeart(cx, cy, r),
        _                             => DrawCircle(cx, cy, r)
    };

    private static IPath DrawCircle(float cx, float cy, float r) =>
        new EllipsePolygon(cx, cy, r);

    private static IPath DrawSquare(float cx, float cy, float r)
    {
        // Pixi: drawRoundedRect(-r*2/3, -r*2/3, r*4/3, r*4/3, r/3) — symmetric, Y direction irrelevant
        float h = r * 2f / 3f;
        float cr = r / 3f;
        float l = cx - h, right = cx + h, top = cy - h, bot = cy + h;
        return new PathBuilder()
            .MoveTo(new PointF(l + cr, top))
            .LineTo(new PointF(right - cr, top))
            .AddArc(new RectangleF(right - 2 * cr, top, 2 * cr, 2 * cr), 0, 270, 90)
            .LineTo(new PointF(right, bot - cr))
            .AddArc(new RectangleF(right - 2 * cr, bot - 2 * cr, 2 * cr, 2 * cr), 0, 0, 90)
            .LineTo(new PointF(l + cr, bot))
            .AddArc(new RectangleF(l, bot - 2 * cr, 2 * cr, 2 * cr), 0, 90, 90)
            .LineTo(new PointF(l, top + cr))
            .AddArc(new RectangleF(l, top, 2 * cr, 2 * cr), 0, 180, 90)
            .CloseFigure()
            .Build();
    }

    private static IPath DrawDiamond(float cx, float cy, float r) =>
        new Polygon(new LinearLineSegment(
            new PointF(cx,     cy + r),
            new PointF(cx + r, cy),
            new PointF(cx,     cy - r),
            new PointF(cx - r, cy)));

    private static IPath DrawTriangle(float cx, float cy, float r)
    {
        // Pixi UpTriangle: apex (0,-r), base (±r√3/2, r/2) — negate Y deltas for pre-flip image
        float h = r * MathF.Sqrt(3f) / 2f;
        return new Polygon(new LinearLineSegment(
            new PointF(cx,     cy + r),
            new PointF(cx - h, cy - r / 2f),
            new PointF(cx + h, cy - r / 2f)));
    }

    private static IPath DrawReversedTriangle(float cx, float cy, float r)
    {
        // Pixi DownTriangle: apex (0,r), base (±r√3/2, -r/2) — negate Y deltas for pre-flip image
        float h = r * MathF.Sqrt(3f) / 2f;
        return new Polygon(new LinearLineSegment(
            new PointF(cx,     cy - r),
            new PointF(cx - h, cy + r / 2f),
            new PointF(cx + h, cy + r / 2f)));
    }

    private static IPath DrawCross(float cx, float cy, float r)
    {
        // Pixi cross gridSize = r/7*3 — 4-way symmetric, Y negation irrelevant
        float g = r / 7f * 3f;
        return new Polygon(new LinearLineSegment(
            new PointF(cx,         cy + g),
            new PointF(cx - g,     cy + g * 2),
            new PointF(cx - g * 2, cy + g),
            new PointF(cx - g,     cy),
            new PointF(cx - g * 2, cy - g),
            new PointF(cx - g,     cy - g * 2),
            new PointF(cx,         cy - g),
            new PointF(cx + g,     cy - g * 2),
            new PointF(cx + g * 2, cy - g),
            new PointF(cx + g,     cy),
            new PointF(cx + g * 2, cy + g),
            new PointF(cx + g,     cy + g * 2)));
    }

    private static IPath DrawHeart(float cx, float cy, float r)
    {
        // Pixi bezier (yOffset = r*0.3), Pixi Y negated for pre-flip image:
        //   start  (0,  r*0.9)        → tip   = (cx,        cy - r*0.9)
        //   bezier to mid (0, -r*0.5) → mid   = (cx,        cy + r*0.5)
        //   cp1L (-r*1.7,  r*0.05)   → (cx - r*1.7,  cy - r*0.05)
        //   cp2L (-r*0.93, -r*1.45)  → (cx - r*0.93, cy + r*1.45)
        //   cp1R ( r*0.93, -r*1.45)  → (cx + r*0.93, cy + r*1.45)
        //   cp2R ( r*1.7,  r*0.05)   → (cx + r*1.7,  cy - r*0.05)
        var tip = new PointF(cx, cy - r * 0.9f);
        var mid = new PointF(cx, cy + r * 0.5f);
        return new Polygon(new CubicBezierLineSegment(
            tip,
            new PointF(cx - r * 1.7f,  cy - r * 0.05f),
            new PointF(cx - r * 0.93f, cy + r * 1.45f),
            mid,
            new PointF(cx + r * 0.93f, cy + r * 1.45f),
            new PointF(cx + r * 1.7f,  cy - r * 0.05f),
            tip));
    }
}
