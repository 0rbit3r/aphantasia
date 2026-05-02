using Aphant.Core.Dto;
using Aphant.Impl.Database.Entity;
using System.Linq.Expressions;

namespace Aphant.Impl.Database.Mapping;

public static class ChatMessageMapper
{
    public static Expression<Func<ChatMessageEntity, ChatMessage>> ToDtoExpr =>
        m => new ChatMessage
        {
            Id = m.Id,
            AuthorUsername = m.Author.Username,
            AuthorColor = m.Author.Color,
            Content = m.Content,
            CreatedAt = m.CreatedAt,
            ParentId = m.ParentId,
            X = m.PositionX,
            Y = m.PositionY
        };
}
