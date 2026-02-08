using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Client.WebApi;

public static class RegisterModule
{
    public static void RegisterWebApiModule(this IServiceCollection services)
    {
        services.AddControllers();
        // services.AddEndpointsApiExplorer(); todo - is this needed?
    }
}
