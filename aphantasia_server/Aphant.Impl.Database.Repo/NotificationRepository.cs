using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Aphant.Core.Contract.Data;
using Microsoft.Extensions.Logging;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;
using Aphant.Impl.Database.Entity;
using System.Linq.Expressions;

namespace Aphant.Impl.Database.Repo;


internal class NotificationRepository(
    AphantasiaDataContext _db,
    ILogger<NotificationRepository> _log
    ) : INotificationDataContract
{
    const int NOTIFICATIONS_PAGE_COUNT = 30;

    public async Task<Result<InboxNotification>> GetNotification(Guid notificationId)
    {
        try
        {
            var result = _db.Notifications
                .Select(NotificationMapper.ToDtoExpr)
                .SingleOrDefault(n => n.Id == notificationId);
            if (result is null)
                return Error.NotFound();
            return result;
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to fetch notification from DB {id}", notificationId);
            return Error.General("Server error");
        }
    }

    public async Task<Result<List<InboxNotification>>> GetUserNotifications(Guid user, Guid? takeBefore)
    {
        try
        {
            var userEntity = await _db.Users.FirstOrDefaultAsync(u => u.Id == user);
            if (userEntity is null)
                return Error.NotFound("User with that id doesn't exist");

            Expression<Func<NotificationEntity, bool>> whereClause = takeBefore is null
                ? (NotificationEntity n) => true
                : (NotificationEntity n) => n.Id < takeBefore;

            return _db.Notifications
                .OrderByDescending(n => n.Id)
                .Where(n => n.UserId == user)
                .Where(whereClause)
                .Take(NOTIFICATIONS_PAGE_COUNT)
                .Select(NotificationMapper.ToDtoExpr)
                .ToList();
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to fetch notifications from DB for user {usr}", user);
            return Error.General("Server error");
        }
    }

    public async Task<Result> InsertNotification(Guid recipient, Guid? thought, Guid? fromUser, string? text)
    {
        try
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == recipient);
            if (user is null)
                return Error.BadRequest("User with that id doesn't exist");


            var entity = new NotificationEntity
            {
                Id = Guid.CreateVersion7(),
                DateCreated = DateTime.UtcNow,
                IsRead = false,
                Text = text,
                ThoughtId = thought,
                UserId = recipient,
                FromUserId = fromUser
            };

            _db.Notifications.Add(entity);
            _db.SaveChanges();

            return Result.Success(entity.Id);
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to insert notification to database");
            return Error.General("Server error");
        }
    }

    public async Task<Result> MarkAllAsRead(Guid userId)
    {
        try
        {
            var userEntity = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (userEntity is null)
                return Error.NotFound("User with that id doesn't exist");


            var unreadNotifications = _db.Notifications
                .Where(n => n.UserId == userId)
                .Where(n => !n.IsRead);

            foreach (var unread in unreadNotifications)
                unread.IsRead = true;

            _db.SaveChanges();

            return Result.Success();
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to mark notifications as read for user {usr}", userId);
            return Error.General("Server error");
        }
    }

    public async Task<Result> MarkAsRead(Guid notification)
    {
        try
        {
            var entity = await _db.Notifications
                .SingleOrDefaultAsync(n => n.Id == notification);

            if (entity is null)
                return Error.NotFound("Notification with that id doesn't exist");

            entity.IsRead = true;

            _db.SaveChanges();

            return Result.Success();
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to mark notification {ntf} as read", notification);
            return Error.General("Server error");
        }
    }
}