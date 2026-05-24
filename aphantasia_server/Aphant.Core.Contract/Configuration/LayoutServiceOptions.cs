namespace Aphant.Core.Contract.Configuration;

public class LayoutServiceOptions
{
    public int ExportImageAfterXRuns { get; set; } = 10;
    public int WaitSecondsBetweenRuns { get; set; } = 60 * 3;
}
