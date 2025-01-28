using Afantazie.Service.Interface.Thoughts;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Thoughts
{
    public static class ServiceExtensions
    {
        public static void AddThoughtsModule(this IServiceCollection services)
        {
            services.AddScoped<IThoughtService, ThoughtService>();
            services.AddScoped<INotificationService, NotificationService>();
        }
    }
}
