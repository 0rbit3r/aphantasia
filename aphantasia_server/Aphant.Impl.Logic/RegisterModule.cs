using Aphant.Boot.LayoutDaemon;
using Aphant.Core.Contract.Logic;
using Aphant.Core.Contracta.Configuration;
using Aphant.Impl.Logic.Epochs;
using Aphant.Impl.Logic.Thoughts;
using Aphant.Impl.Logic.Users;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.Logic;

public static class RegisterModule
{
    public static void RegisterLogicModule(this IServiceCollection services)
    {
        services.AddScoped<IThoughtLogicContract, ThoughtLogicService>();
        services.AddScoped<IUserLogicContract, UserLogicService>();
        services.AddScoped<IEpochLogicContract, EpochLogicService>();
        services.AddHostedService<ChatBackgroundService>();
    }
    
    public static void RegisterEpochBackgroundService(this IServiceCollection services) //todo - do the same for Chat Service
    {
        services.AddHostedService<EpochBackgroundService>();
        services.AddOptions<EpochOptions>()
            .BindConfiguration("Epochs") 
            .ValidateDataAnnotations()
            .ValidateOnStart();
    }
}