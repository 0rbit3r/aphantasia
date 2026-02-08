using Aphant.Client.WebApi;
using Aphant.Impl.DbRepository;
using Aphant.Impl.Logic;
using Aphant.Core.Database;
using Serilog;
using Aphant.Impl.Auth;


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
builder.Services.RegisterDbRepositoryModule();
builder.Services.RegisterLogicModule();
builder.Services.RegisterDatabaseAccessModule(builder.Configuration);
builder.Services.RegisterAuthorizationModule(builder.Configuration);
// builder.Services.AddChatModule();

// builder.Services.AddSiteActivityModule();

// builder.Services.AddThoughtsModule();

// builder.Services.AddProfilesModule();

// builder.Services.AddDataModule();

// builder.Services.AddAuthenticationModule(builder.Configuration);

// builder.Services.AddUserSettingsModule();

builder.Services.AddSerilog();

// builder.Services.RegisterGraphLayoutModule(builder.Configuration);

// EntityMappingConfiguration.ConfigureEntityMapping();
// DtoMappingConfiguration.ConfigureDtoMapping();

var app = builder.Build();

app.Logger.LogInformation("Aplication built with language {language}", builder.Configuration.GetValue<string>("ApplicationLanguage"));

//app.UseHttpsRedirection();

//app.UseWebSockets();

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
