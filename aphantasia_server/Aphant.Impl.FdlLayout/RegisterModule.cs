using Aphant.Core.Contract;
using Aphant.Core.Dto;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.FdlLayout;

public static class RegisterModule
{
    public static void RegisterFdlLayoutModule(this IServiceCollection services, IConfiguration config)
    {
        services.AddTransient<ILayoutLogicContract, FdlLayoutService>();
        services.Configure<FdlLayoutOptions>("Thought", config.GetSection("ThoughtLayout"));
        services.Configure<FdlLayoutOptions>("Chat", config.GetSection("ChatLayout"));
    }
}
