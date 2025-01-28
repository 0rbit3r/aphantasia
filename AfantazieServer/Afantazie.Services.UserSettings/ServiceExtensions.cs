using Afantazie.Service.Interface.UserSettings;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.UserSettings
{
    public static class ServiceExtensions
    {
        public static void AddUserSettingsModule(this IServiceCollection services)
        {
            services.AddScoped<IUserSettingsService, UserSettingsService>();
        }
    }
}
