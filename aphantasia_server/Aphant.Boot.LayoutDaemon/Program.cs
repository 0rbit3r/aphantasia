using Aphant.Impl.Database.Repo;
using Aphant.Impl.Database;
using Serilog;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Aphant.Impl.FdlLayout;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Aphant.Boot.LayoutDaemon;

var options = new HostApplicationBuilderSettings
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory
};

var builder = new HostApplicationBuilder(options);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

// Add modules
builder.Services.RegisterDbRepositoryModule(builder.Configuration);
builder.Services.RegisterFdlLayoutModule(builder.Configuration);
builder.Services.AddHostedService<LayoutBackgroundService>();

builder.Services.Configure<LayoutDaemonOptions>(builder.Configuration.GetSection("LayoutDaemon"));

builder.Services.AddDbContext<AphantasiaDataContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
        .UseSnakeCaseNamingConvention());

builder.Services.AddSerilog();

var app = builder.Build();

var logger = app.Services.GetRequiredService<ILogger<Program>>();

logger.LogInformation("Application built with Environment {env}", builder.Environment.EnvironmentName);

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "An error occurred while running the application");
}
finally
{
    Log.CloseAndFlush();
}
