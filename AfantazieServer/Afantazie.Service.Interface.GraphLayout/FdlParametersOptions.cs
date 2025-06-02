namespace Afantazie.Service.Interface.GraphLayout;

public class FdlParametersOptions
{
    public string LayoutPNGsPath { get; set; } = "";
    public int ImageExportFramesPeriod { get; set; }

    public int Resolution { get; set; }
    public double Scale { get; set; } 
    public int ViewportPositionX { get; set; }
    public int ViewportPositionY { get; set; }


    public double PullForce { get; set; }
    public double PushForce  { get; set; }
    public bool AllowOverlap { get; set; }
    public double SimWidth { get; set; }
    public double SimHeight { get; set; }
    public double BaseRadius { get; set; }
    public double ReferenceRadiusMultiplier { get; set; }
    public double MaxRadius { get; set; }
    public double PushThreshold { get; set; }
    public double MaxPushForce { get; set; }
    public double MaxPullForce { get; set; }

    public double MaxMovementSpeed { get; set; }
    public double EdgeCompresibilityFactor { get; set; }
    public bool GravityEnabled { get; set; }
    public double GravityForce { get; set; }
    public double GravityFreeRadius { get; set; }

    public double MaxGravityForce { get; set; }
    public bool NodeMassOn { get; set; }
    public double MaxMassDifferencePullForceMultiplier { get; set; }
    public double MinMassDifferencePullForceMultiplier { get; set; }
    public double MaxMassDifferencePushForceMultiplier { get; set; }
    public double MinMassDifferencePushForceMultiplier { get; set; }
    public double IdealEdgeLength { get; set; }

    // values of this can only ever increase the length, ie. the first few sizes dont affect it. if set under
    public double IdealDistSizeMultiplier { get; set; }
    public double DampeningRate { get; set; }
}
