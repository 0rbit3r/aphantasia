namespace Aphant.Core.Contract.Configuration;

public class LayoutServiceOptions
{
    public string LayoutPNGsPath { get; set; } = "";
    public int ExportImageAfterXRuns { get; set; } = 10;
    public int WaitBetweenRuns { get; set; } = 60 * 3;
}
