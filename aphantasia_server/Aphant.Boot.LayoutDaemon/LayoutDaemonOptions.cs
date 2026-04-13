namespace Aphant.Boot.LayoutDaemon;

public class LayoutDaemonOptions
{
    public string LayoutPNGsPath { get; set; } = "";
    // How often to export an image of the layout
    public int ExportImageAfterXRuns { get; set; } = 10;

    // How many iterations to run at a time
    public int IterationsPerRun { get; set; } = 10;
    // Wait time in seconds between runs
    public int WaitBetweenRuns { get; set; } = 60 * 3;
}