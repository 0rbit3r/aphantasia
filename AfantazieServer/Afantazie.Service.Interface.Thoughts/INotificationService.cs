using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Interface.Thoughts
{
    public interface INotificationService
    {
        Task<Result<List<Notification>>> GetNotificationsForUser(int userId, int amount);

        Task<Result> HandleReplyNotificationsCreation(int thoughtId);

        Task<Result> MarkAllNotificationsRead(int userId);

        Task<Result> MarkNotificationRead(int id);
    }
}
