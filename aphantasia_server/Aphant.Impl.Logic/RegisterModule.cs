using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;
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
    }
}