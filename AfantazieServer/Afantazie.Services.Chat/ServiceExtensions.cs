using Afantazie.Service.Chat.Services;
using Afantazie.Services.Interface.Chat;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Chat
{
    public static class ServiceExtensions
    {
        public static void AddChatModule(this IServiceCollection services)
        {
            services.AddSingleton<IChatTicketService, ChatTicketService>();
            services.AddSingleton<IChatService, ChatService>();
        }
    }
}
