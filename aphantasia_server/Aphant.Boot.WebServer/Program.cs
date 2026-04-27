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
        b =>
        {
            if (builder.Environment.IsDevelopment())
                b.AllowAnyOrigin();
            else
                b.WithOrigins(
                "https://aphant.dev", "https://www.aphant.dev"); //define this based on config later
            b.AllowAnyHeader()
            .AllowAnyMethod();
        });
});

// builder.Services.AddSignalR(opts =>
// {
//     //opts.SupportedProtocols = new List<string> { "json" };
//     if (builder.Environment.IsDevelopment())
//         opts.EnableDetailedErrors = true;
// });

// builder.Services.AddLanguageLocalization(builder.Configuration);

// // Add modules
builder.Services.RegisterWebApiModule();
builder.Services.RegisterDbRepositoryModule(builder.Configuration);
builder.Services.RegisterLogicModule();
builder.Services.RegisterAuthorizationModule(builder.Configuration);

builder.Services.AddDbContext<AphantasiaDataContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), o =>
        o.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null))
        .UseSnakeCaseNamingConvention());
 

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
