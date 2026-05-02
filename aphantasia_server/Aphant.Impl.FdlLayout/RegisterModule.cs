using Aphant.Core.Contract;
using Aphant.Core.Contract.Logic;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.FdlLayout;

public static class RegisterModule
{
    public static void RegisterFdlLayoutModule(this IServiceCollection services, IConfiguration config)
    {
        services.AddTransient<ILayoutLogicContract, FdlLayoutService>();
        services.Configure<FdlLayoutOptions>(config.GetSection("FdlLayout"));

        services.AddTransient<IChatLayoutContract, ChatFdlLayoutService>();
        services.Configure<ChatFdlLayoutOptions>(config.GetSection("ChatFdlLayout"));
    }
}
