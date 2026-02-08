using Aphant.Core.Interface;
using Aphant.Impl.Auth;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.Auth;

public static class RegisterModule
{
    public static void RegisterAuthorizationModule(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
    }
}