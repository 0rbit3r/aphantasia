using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Repository
{
    public static class ServiceExtensions
    {
        public static void AddDataModule(this IServiceCollection services)
        {
            services.AddScoped<IUserAuthRepository, UserAuthRepository>();
            services.AddScoped<DataContextProvider>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IThoughtRepository, ThoughtRepository>();
            services.AddScoped<INotificationsRepository, NotificationsRepository>();
            services.AddScoped<IConceptRepository, ConceptRepository>();
        }
    }
}
