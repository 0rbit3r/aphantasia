using System.Linq.Expressions;
using Aphant.Impl.Database.Entity;
using Aphant.Core.Dto;

namespace Aphant.Impl.Database.Mapping;

public static class NotificationMapper
{
    public static Expression<Func<NotificationEntity, InboxNotification>> ToDtoExpr = (NotificationEntity entity) =>
        new InboxNotification
        {
            Id = entity.Id,
            Read = entity.IsRead,
            Text = entity.Text,
            DateCreated = entity.DateCreated.ToString("yyyy-MM-dd"),
            RecipientId = entity.UserId,
            Thought = entity.Thought == null ? null : new ThoughtTitle
            {
                Id=entity.Thought.Id,
                Color= entity.Thought.Color,
                Title=entity.Thought.Title,
                Shape=entity.Thought.Shape
            },
            FromUser=entity.FromUser == null ? null : new UserColorName
            {
                Id=entity.FromUser.Id,
                Color=entity.FromUser.Color,
                Username=entity.FromUser.Username
            }
        };

    public static InboxNotification ToDto(this NotificationEntity entity)
    {
        return ToDtoExpr.Compile()(entity);
    }
}

