using Aphant.Core.Contract.Configuration;
using Aphant.Core.Contract.Logic;
using Aphant.Core.Contracta.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.FdlLayout;

public static class RegisterModule
{
    public static void RegisterFdlLayoutModule(this IServiceCollection services)
    {
        services.AddTransient<ILayoutLogicContract, FdlLayoutService>();
        services.AddOptions<FdlLayoutOptions>("Thought")
            .BindConfiguration("ThoughtLayout")
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddOptions<FdlLayoutOptions>("Chat")
            .BindConfiguration("ChatLayout")
            .ValidateDataAnnotations()
            .ValidateOnStart();
        services.AddOptions<EpochOptions>()
            .BindConfiguration("Epochs")
            .ValidateDataAnnotations()
            .ValidateOnStart();
    }
}
