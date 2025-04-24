using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
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
        public Task<Result<List<Notification>>> GetNotificationsForUser(int userId, int amount)
        {
           return _notificationsRepository.GetNotificationsForUserAsync(userId, amount);
        }

        public async Task<Result> HandleReplyNotificationsCreation(int thoughtId)
        {
            var result = await _notificationsRepository.HandleReplyNotificationsCreationAsync(thoughtId);
            if (!result.IsSuccess)
            {
                return Error.General(500, "Failed to create reply notification");
            }

            return Result.Success();
        }

        public async Task<Result> MarkAllNotificationsRead(int userId)
        {
            var notifications = await _notificationsRepository.GetNotificationsForUserAsync(userId, 100);
            if (!notifications.IsSuccess)
            {
                return notifications.Error!;
            }
            var unreadNotifications = notifications.Payload!
                .Where(n => !n.IsRead)
                .ToList();

            foreach(var notification in unreadNotifications)
            {
                await _notificationsRepository.MarkNotificationReadAsync(notification.Id);
            }   

            return Result.Success();
        }

        public Task<Result> MarkNotificationRead(int id)
        {
            return _notificationsRepository.MarkNotificationReadAsync(id);
        }
    }
}
