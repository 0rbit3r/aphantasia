namespace Aphant.Impl.FdlLayout;

public class ChatFdlLayoutOptions
{
    public double BaseRadius { get; set; } = 80;
    public double PullForce { get; set; } = 0.05;
    public double PushForce { get; set; } = 5;
    public double PushThreshold { get; set; } = 2000;
    public double MaxPushForce { get; set; } = 80;
    public double MaxPullForce { get; set; } = 500;
    public double IdealEdgeLength { get; set; } = 200;
    public double MaxMovementSpeed { get; set; } = 80;
    public double DampeningRate { get; set; } = 1.7;
    public double EdgeCompresibilityFactor { get; set; } = 0.7;
    public bool GravityEnabled { get; set; } = true;
    public double GravityForce { get; set; } = 0.5;
    public double GravityFreeRadius { get; set; } = 5000;
    public double MaxGravityForce { get; set; } = 50;
}
