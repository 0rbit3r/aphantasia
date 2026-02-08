using Aphant.Core.Interface;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.Database.Repo;

public static class RegisterModule
{
    public static void RegisterDbRepositoryModule(this IServiceCollection services)
    {
        services.AddScoped<IDataService, DbRepository>();
    }
}