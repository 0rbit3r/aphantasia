using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface INotificationDataContract
{
    /// <summary>
    /// Gets all notifications for given user
    /// </summary>
    /// <param name="userId">User id</param>
    /// <param name="takeBefore">Id of the Notification after which to exclude the results (for paging by "load more")</param>
    /// <returns>Returns all read and unread notifications for given user</returns>
    Task<Result<List<InboxNotification>>> GetUserNotifications(Guid userId, Guid? takeBefore = null);

    // todo - this uses two joins - maybe introduce notificationLight?
    Task<Result<InboxNotification>> GetNotification(Guid notificationId);
    Task<Result> MarkAsRead(Guid notificationId);
    Task<Result> MarkAllAsRead(Guid userId);
    Task<Result> InsertNotification(Guid recipientId, Guid? thoughtId, Guid? fromUserId, string? text);
}
