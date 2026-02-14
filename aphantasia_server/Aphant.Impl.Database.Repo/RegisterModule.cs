using Microsoft.Extensions.DependencyInjection;
using Aphant.Core.Contract.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Aphant.Impl.Database.Repo;

public static class RegisterModule
{
    public static void RegisterDbRepositoryModule(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<IThoughtDataContract, ThoughtRepository>();
        services.AddScoped<IUserDataContract, UserRepository>();
    }
}