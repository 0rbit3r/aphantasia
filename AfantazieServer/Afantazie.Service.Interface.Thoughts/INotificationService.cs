using Afantazie.Core.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Interface.Thoughts
{
    public interface INotificationService
    {
        Task<List<Thought>> GetNotificationsForUser(int userId);
    }
}
