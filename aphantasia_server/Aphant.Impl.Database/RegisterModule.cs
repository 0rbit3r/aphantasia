using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.Database.Repo;

public static class RegisterModule
{
    public static void RegisterDatabaseAccessModule(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AphantasiaDataContext>(options =>
            options.UseNpgsql(config.GetConnectionString("DefaultConnection")));
    }
}