using Afantazie.Service.Interface.Profiles;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Profiles
{
    public static class ServiceExtensions
    {
        new public static void AddProfilesModule(this IServiceCollection services)
        {
            services.AddScoped<IUserProfileService, UserProfileService>();
        }
    }
}
