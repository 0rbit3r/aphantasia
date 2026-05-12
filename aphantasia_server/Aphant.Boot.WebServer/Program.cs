using Aphant.Client.Chat;
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
                b.SetIsOriginAllowed(_ => true).AllowCredentials();
            else
                b.WithOrigins("https://aphant.dev", "https://www.aphant.dev")
                 .AllowCredentials();
            b.AllowAnyHeader()
             .AllowAnyMethod();
        });
});

// // Add modules
builder.Services.RegisterChatModule(builder.Environment.IsDevelopment());
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

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

app.UseRouting();

app.UseCors(allowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<ChatHub>("/hub/chat").RequireCors(allowSpecificOrigins);
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
