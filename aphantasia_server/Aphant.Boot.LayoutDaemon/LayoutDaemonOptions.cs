namespace Aphant.Boot.LayoutDaemon;

public class LayoutDaemonOptions
{
    public string LayoutPNGsPath { get; set; } = "";
    public int ExportImageAfterXRuns { get; set; } = 10;
    public int WaitBetweenRuns { get; set; } = 60 * 3;
}
