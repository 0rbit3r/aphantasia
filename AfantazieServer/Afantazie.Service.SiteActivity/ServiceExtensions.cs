using Afantazie.Service.Interface.SiteActivity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.SiteActivity
{
    public static class ServiceExtensions
    {
        public static void AddSiteActivityModule(this IServiceCollection services)
        {
            services.AddSingleton<IStatsService, StatsService>();
            services.AddScoped<IActivityLogService, ActivityLogService>();
        }
    }
}
