using Aphant.Client.WebApi;
using Aphant.Impl.Database.Repo;
using Aphant.Impl.Logic;
using Aphant.Impl.Database;
using Serilog;
using Aphant.Impl.Auth;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

var allowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(allowSpecificOrigins,
        builder =>
        {
            //todo - setorigiallowed should not be in production
            builder
            .SetIsOriginAllowed(_ => true)
            .WithOrigins(
                "http://localhost:4200", "http://localhost:5173",
                "https://aphantasia.cz", "https://www.aphantasia.cz",
                "https://aphantasia.io", "https://www.aphantasia.io"//todo rework this
                )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
});

builder.Services.AddSignalR(opts =>
{
    //opts.SupportedProtocols = new List<string> { "json" };
    if (builder.Environment.IsDevelopment())
        opts.EnableDetailedErrors = true;
});

// builder.Services.AddLanguageLocalization(builder.Configuration);

// // Add modules
builder.Services.RegisterWebApiModule();
builder.Services.RegisterDbRepositoryModule(builder.Configuration);
builder.Services.RegisterLogicModule();
builder.Services.RegisterAuthorizationModule(builder.Configuration);

builder.Services.AddDbContext<AphantasiaDataContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Services.AddSerilog();

var app = builder.Build();

app.Logger.LogInformation("Aplication built with language {language}", builder.Configuration.GetValue<string>("ApplicationLanguage"));

//app.UseHttpsRedirection();

app.UseCors(allowSpecificOrigins);

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

app.UseRouting();

app.UseAuthorization();

//app.UseMiddleware<JwtBearerSignalRMiddleware>();
// app.MapHub<ChatHub>("hub/chat", opts =>
// {

// });
// app.MapHub<StatsHub>("hub/stats");

app.MapControllers();

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
