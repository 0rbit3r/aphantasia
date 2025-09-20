using Afantazie.Core.Model.Results;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Afantazie.Service.Interface.GraphLayout;
using Microsoft.Extensions.Options;

namespace Afantazie.Tools;

public static class ManualFDL
{

    public static async Task<Result> RunFDL(IServiceProvider services)
    {
        using var scope = services.CreateAsyncScope();
        var layoutService = scope.ServiceProvider.GetRequiredService<IGraphLayoutService>();
        var opts = scope.ServiceProvider
            .GetRequiredService<IOptionsMonitor<FdlParametersOptions>>().CurrentValue;
        var shouldEnd = false;
        int framesInput = 0;
        while (!shouldEnd)
        {
            var wrongChoice = true;
            while (wrongChoice)
            {
                opts = scope.ServiceProvider
                    .GetRequiredService<IOptionsMonitor<FdlParametersOptions>>().CurrentValue;
                Console.WriteLine("Enter number of frames or 'end' to exit:");
                var input = Console.ReadLine();
                if (input == "end") return Result.Success();
                wrongChoice = !int.TryParse(input, out int desiredFrames);
                if (wrongChoice)
                {
                    Console.WriteLine("Bad input.");
                    continue;
                }
                framesInput = desiredFrames;
            }
            if (opts.ImageExportFramesPeriod == 0)
            {
                await layoutService.RunFDLAsync(framesInput);
                await layoutService.PrintImage();
            }
            else
            {
                int remainingFrames = framesInput;
                while (remainingFrames > 0)
                {
                    var frames = Math.Min(framesInput, opts.ImageExportFramesPeriod);
                    await layoutService.RunFDLAsync(frames);
                    await layoutService.PrintImage();
                    remainingFrames -= opts.ImageExportFramesPeriod;
                }
            }


        }
        Console.WriteLine("Exiting FDL...");
        return Result.Success();
    }

    public static async Task<Result> RandomizePositions(IServiceProvider services)
    {
        var layoutService = services.GetRequiredService<IGraphLayoutService>();
        return await layoutService.RandomizePositionsAsync();
    }

}