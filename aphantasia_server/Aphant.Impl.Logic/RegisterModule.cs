using Aphant.Core.Contract.Data;
using Aphant.Impl.Logic.Thoughts;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.Logic;

public static class RegisterModule
{
    public static void RegisterLogicModule(this IServiceCollection services)
    {
        services.AddScoped<IThoughtLogicContract, ThoughtLogicService>();
    }
}