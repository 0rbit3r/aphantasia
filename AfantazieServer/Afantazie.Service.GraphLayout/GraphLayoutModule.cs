using Afantazie.Service.Interface.GraphLayout;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Afantazie.Service.GraphLayout;

public static class GraphLayoutModule
{
    public static void RegisterGraphLayoutModule(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<IGraphLayoutService, GraphLayoutService>();
        services.Configure<FdlParametersOptions>(config.GetSection("FdlParameters"));
    }
}