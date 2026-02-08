using Aphant.Core.Interface;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aphant.Impl.Auth;

public static class RegisterModule
{
    public static void RegisterAuthorizationModule(this IServiceCollection services, IConfiguration config)
    {
        services.AddScoped<IAuthService, AuthService>();

        // Todo - think about whether this really belongs here or if it is more of a WebApi's responsibility
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = JwtUtil.GetTokenValidationParameters(config);
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            // If the request is for our hub...
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub"))
                            {
                                // Read the token out of the query string
                                // todo - this needs to be changed when hub is used
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });
    }
}