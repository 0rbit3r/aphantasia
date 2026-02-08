using Aphant.Core.Database;
using Aphant.Core.Interface;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.DbRepository;

public static class RegisterModule
{
    public static void RegisterDbRepositoryModule(this IServiceCollection services)
    {
        services.AddScoped<IDataService, DatabaseRepository>();
    }
}