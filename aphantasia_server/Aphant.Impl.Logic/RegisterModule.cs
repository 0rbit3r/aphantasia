using Aphant.Core.Interface;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.Logic;

public static class RegisterModule
{
    public static void RegisterLogicModule(this IServiceCollection services)
    {
        services.AddScoped<ILogicService, LogicService>();
    }
}