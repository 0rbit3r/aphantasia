using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Interface.Repository
{
    public interface INotificationsRepository
    {
        Task<Result> HandleReplyNotificationsCreationAsync(int thoughtId);

        Task<Result<List<Notification>>> GetNotificationsForUserAsync(int userId, int amount);

        Task<Result> MarkNotificationReadAsync(int id);
    }
}
