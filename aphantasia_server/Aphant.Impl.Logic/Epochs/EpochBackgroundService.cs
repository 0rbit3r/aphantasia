using Microsoft.Extensions.Hosting;


namespace Aphant.Boot.LayoutDaemon;

public class EpochBackgroundService : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        //this will continually call Aphant.Contract.Logic.IEpochLogicContract.CheckContextAndCreateEpoch
        throw new NotImplementedException();
    }
}
