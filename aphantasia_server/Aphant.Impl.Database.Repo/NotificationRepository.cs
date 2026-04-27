using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract.Data;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;
using Aphant.Impl.Database.Entity;
using System.Linq.Expressions;

namespace Aphant.Impl.Database.Repo;

internal class NotificationRepository(AphantasiaDataContext _db) : INotificationDataContract
{
    const int NOTIFICATIONS_PAGE_COUNT = 30;

    public async Task<Result<InboxNotification>> GetNotification(Guid notificationId)
    {
        var result = _db.Notifications
            .Select(NotificationMapper.ToDtoExpr)
            .SingleOrDefault(n => n.Id == notificationId);
        if (result is null)
            return Error.NotFound();
        return result;
    }

    public async Task<Result<List<InboxNotification>>> GetUserNotifications(Guid user, Guid? takeBefore)
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

    public async Task<Result> InsertNotification(Guid recipient, Guid? thought, Guid? fromUser, string? text)
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
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Error.General("Server error");
        }
        return Result.Success(entity.Id);
    }

    public async Task<Result> MarkAllAsRead(Guid userId)
    {
        var userEntity = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (userEntity is null)
            return Error.NotFound("User with that id doesn't exist");

        var unreadNotifications = _db.Notifications
            .Where(n => n.UserId == userId)
            .Where(n => !n.IsRead);

        foreach (var unread in unreadNotifications)
            unread.IsRead = true;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Error.General("Server error");
        }
        return Result.Success();
    }

    public async Task<Result> MarkAsRead(Guid notification)
    {
        var entity = await _db.Notifications
            .SingleOrDefaultAsync(n => n.Id == notification);

        if (entity is null)
            return Error.NotFound("Notification with that id doesn't exist");

        entity.IsRead = true;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Error.General("Server error");
        }
        return Result.Success();
    }
}
