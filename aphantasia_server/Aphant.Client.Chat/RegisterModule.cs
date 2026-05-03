using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Client.Chat;

public static class RegisterModule
{
    public static void RegisterChatModule(this IServiceCollection services, bool isDevelopment)
    {
        services.AddSignalR(opts => opts.EnableDetailedErrors = isDevelopment);
    }
}
