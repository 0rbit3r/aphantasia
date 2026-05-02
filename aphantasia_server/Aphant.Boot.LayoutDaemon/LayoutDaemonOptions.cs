namespace Aphant.Boot.LayoutDaemon;

public class LayoutDaemonOptions
{
    public string LayoutPNGsPath { get; set; } = "";
    public int ExportImageAfterXRuns { get; set; } = 10;
    public int IterationsPerRun { get; set; } = 10;
    public int WaitBetweenRuns { get; set; } = 60 * 3;

    public int ChatIterationsPerRun { get; set; } = 50;
}