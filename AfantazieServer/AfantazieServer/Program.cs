using Afantazie.Data.Repository;
using Afantazie.Presentation.Api;
using Afantazie.Presentation.Api.Hubs;
using Afantazie.Data.Model.Mapping;
using Afantazie.Service.Thoughts;
using Afantazie.Presentation.Model.Mapping;
using Serilog;
using Afantazie.Service.UserSettings;
using Afantazie.Service.Auth;
using Afantazie.Service.Chat;
using Afantazie.Service.SiteActivity;
using Afantazie.Core.Localization;


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
            //todo - production?
            builder.WithOrigins(
                "http://localhost:4200", "http://localhost:5173",
                "https://afantazie.cz", "https://www.afantazie.cz",
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

builder.Services.AddLanguageLocalization(builder.Configuration);

// Add modules
builder.Services.AddApiModule();

builder.Services.AddChatModule();

builder.Services.AddSiteActivityModule();

builder.Services.AddThoughtsModule();

builder.Services.AddDataModule();

builder.Services.AddAuthenticationModule(builder.Configuration);

builder.Services.AddUserSettingsModule();

builder.Services.AddSerilog();

EntityMappingConfiguration.ConfigureEntityMapping();
DtoMappingConfiguration.ConfigureDtoMapping();

var app = builder.Build();

app.Logger.LogInformation("Aplication built with language {language}", builder.Configuration.GetValue<string>("ApplicationLanguage"));

//app.UseHttpsRedirection();

//app.UseWebSockets();

app.UseCors(allowSpecificOrigins);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseAuthorization();

//app.UseMiddleware<JwtBearerSignalRMiddleware>();
app.MapHub<ChatHub>("hub/chat", opts =>
{

});
app.MapHub<StatsHub>("hub/stats");

app.MapControllers();

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "An error occurred while starting the application");
}
finally
{
    Log.CloseAndFlush();
}
