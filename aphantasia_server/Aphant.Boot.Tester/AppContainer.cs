using Aphant.Core.Contract.Data;
using Aphant.Impl.Auth;
using Aphant.Impl.Database;
using Aphant.Impl.Database.Repo;
using Aphant.Impl.Logic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;

public class AppContainer<T> : IDisposable
{

    private IHost app { get; set; }
    public IServiceProvider Services { get; private set; }

    public AppContainer()
    {
        HostApplicationBuilder builder = new HostApplicationBuilder();
        IConfiguration configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .Build();

        // // Add modules
        builder.Services.RegisterDbRepositoryModule(configuration);
        builder.Services.RegisterAuthorizationModule(configuration);
        builder.Services.RegisterLogicModule();
        builder.Services.AddSerilog();

        var connString = builder.Configuration.GetConnectionString("DefaultConnection")?.Replace("{{id}}", typeof(T).Name);

        builder.Services.AddDbContext<AphantasiaDataContext>(options =>
            options.UseNpgsql(connString));

        app = builder.Build();
        Services = app.Services;

        var db = Services.GetRequiredService<AphantasiaDataContext>();
        db.Database.EnsureDeleted();
        db.Database.Migrate();
    }


    public void Dispose()
    {
        var db = Services.GetRequiredService<AphantasiaDataContext>();
        db.Database.EnsureDeleted();
        app.Dispose();
    }
}