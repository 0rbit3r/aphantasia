using Aphant.Core.Contract;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.FdlLayout;

public static class RegisterModule
{
    public static void RegisterFdlLayoutModule(this IServiceCollection services, IConfiguration config)
    {
        services.AddTransient<ILayoutLogicContract, FdlLayoutService>();
        services.Configure<FdlLayoutOptions>(config.GetSection("FdlLayout"));
    }
}
