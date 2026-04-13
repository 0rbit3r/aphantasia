namespace Aphant.Impl.FdlLayout;

internal class GraphNode
{

    public Guid Id;
    public double PositionX;
    public double PositionY;
    public int Size;
    public int Radius;
    public List<Guid> Links = new();
    public List<Guid> BackLinks = new();
    public double ForcesX;
    public double ForcesY;
    public double MomentumX;
    public double MomentumY;
}