using Microsoft.Extensions.DependencyInjection;
using Aphant.Core.Contract.Data;

namespace Aphant.Impl.Database.Repo;

public static class RegisterModule
{
    public static void RegisterDbRepositoryModule(this IServiceCollection services)
    {
        services.AddScoped<IThoughtDataContract, ThoughtRepository>();
        services.AddScoped<IUserDataContract, UserRepository>();
        services.AddScoped<IEpochDataContract, EpochRepository>();
        services.AddScoped<INotificationDataContract, NotificationRepository>();
        services.AddScoped<IChatDataContract, ChatRepository>();
        services.AddScoped<IConceptDataContract, ConceptRepository>();
    }
}