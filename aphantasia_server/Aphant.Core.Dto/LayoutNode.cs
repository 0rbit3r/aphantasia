namespace Aphant.Core.Dto;

public class LayoutNode
{
    public Guid Id { get; init; }
    public double X { get; set; }
    public double Y { get; set; }
    public int Size { get; init; }
    public string Color { get; init; } = "#ffffff";
    public ThoughtShape Shape { get; init; } = ThoughtShape.Circle;
    public List<Guid> Links { get; init; } = [];
    public List<Guid> BackLinks { get; init; } = [];
    public bool IsFixed { get; set; } = false;
        //todo - this is not used in GraphNode in the actual fdl - might add logic there that skips logic on fixed node pairs
}
