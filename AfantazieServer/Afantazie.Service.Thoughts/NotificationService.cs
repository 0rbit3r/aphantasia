using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Data.Interface.Repository;
using Afantazie.Service.Interface.Thoughts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Thoughts
{
    internal class NotificationService(
        INotificationsRepository _notificationsRepository
        ) : INotificationService
    {
        public Task<Result<List<Thought>>> GetNotificationsForUser(int userId, int amount)
        {
           return _notificationsRepository.GetNotificationsForUser(userId, amount);
        }
    }
}
