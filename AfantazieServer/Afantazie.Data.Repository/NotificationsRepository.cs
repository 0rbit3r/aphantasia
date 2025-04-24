using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Afantazie.Data.Model.Entity;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Repository
{
    internal class NotificationsRepository(
        DataContextProvider _contextProvider,
        ILogger<NotificationsRepository> _log) : INotificationsRepository
    {
        public async Task<Result<List<Notification>>> GetNotificationsForUserAsync(int userId, int amount)
        {
            using (var dbContext = _contextProvider.GetDataContext())
            {
                try
                {
                    var user = await dbContext.Users
                        .Where(u => u.Id == userId)
                        .Include(u => u.Notifications).ThenInclude(n => n.Thought).ThenInclude(t => t.Author)
                        .FirstOrDefaultAsync();

                    if (user is null) return Error.NotFound();

                    var notifications = user.Notifications
                        .OrderByDescending(n => n.DateCreated)
                        .Take(amount);

                    return notifications.Adapt<List<Notification>>();
                }
                catch (Exception ex)
                {
                    _log.LogWarning(ex, "Failed to get notifications for user {userId}", userId) ;
                    return Error.General(500, "Failed to get notifications for user");
                }
            }
        }

        public async Task<Result> HandleReplyNotificationsCreationAsync(int thoughtId)
        {
            using (var dbContext = _contextProvider.GetDataContext())
            {
                try
                {
                    var thought = await dbContext.Thoughts
                        .Where(x => x.Id == thoughtId)
                        .Include(x => x.Links).ThenInclude(l => l.TargetThought)
                        .FirstOrDefaultAsync();

                    if (thought is null) return Error.NotFound();

                    foreach(var link in thought.Links)
                    {
                        if (link.TargetThought.AuthorId == thought.AuthorId)
                            continue;

                        var result = dbContext.Notifications.Add(
                            new NotificationEntity
                            {
                                DateCreated = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc),
                                Type = (byte)NotificationType.Reply,
                                UserId = link.TargetThought.AuthorId,
                                IsRead = false,
                                ThoughtId = link.SourceThought.Id,
                            });
                    }

                    await dbContext.SaveChangesAsync();

                    return Result.Success();
                }
                catch (Exception ex)
                {
                    _log.LogWarning(ex, "Failed to create reply notifications for new thought {thoughtId}", thoughtId);
                    return Error.General(500, "Failed to create reply notifications for new thought");
                }
            }
        }

        public async Task<Result> MarkNotificationReadAsync(int id)
        {
            using (var dbContext = _contextProvider.GetDataContext())
            {
                try
                {
                    var notification = await dbContext.Notifications
                        .Where(n => n.Id == id)
                        .FirstOrDefaultAsync();

                    if (notification is null) return Error.NotFound();

                    notification.IsRead = true;

                    dbContext.SaveChanges();

                    return Result.Success();
                }
                catch (Exception ex)
                {
                    _log.LogWarning(ex, "Failed to mark notification {id} as read", id);
                    return Error.General(500, "Failed to mark notification as read");
                }
            }
        }
    }
}
