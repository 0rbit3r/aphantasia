using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database;
using Aphant.Impl.Database.Entity;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.Database.Repo;

internal class ChatRepository(AphantasiaDataContext _db) : IChatDataContract
{
    private static readonly TimeSpan MessageLifetime = TimeSpan.FromHours(3);

    public async Task<Result<List<ChatMessage>>> GetActiveMessages()
    {
        var cutoff = DateTime.UtcNow - MessageLifetime;
        return await _db.ChatMessages
            .Where(m => m.CreatedAt > cutoff)
            .Select(ChatMessageMapper.ToDtoExpr)
            .ToListAsync();
    }

    public async Task<Result<ChatMessage>> InsertMessage(Guid userId, string content, Guid? parentId, double x, double y)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return Error.NotFound("User not found");

        if (parentId.HasValue)
        {
            var parentExists = await _db.ChatMessages.AnyAsync(m => m.Id == parentId.Value);
            if (!parentExists)
                return Error.NotFound("Parent message not found");
        }

        var entity = new ChatMessageEntity
        {
            Id = Guid.CreateVersion7(),
            AuthorId = userId,
            Content = content.Trim(),
            CreatedAt = DateTime.UtcNow,
            ParentId = parentId,
            PositionX = x,
            PositionY = y
        };

        _db.ChatMessages.Add(entity);
        await _db.SaveChangesAsync();

        return new ChatMessage
        {
            Id = entity.Id,
            AuthorUsername = user.Username,
            AuthorColor = user.Color,
            Content = entity.Content,
            CreatedAt = entity.CreatedAt,
            ParentId = entity.ParentId,
            X = x,
            Y = y
        };
    }

    public async Task<Result> DeleteExpiredMessages()
    {
        var cutoff = DateTime.UtcNow - MessageLifetime;
        await _db.ChatMessages
            .Where(m => m.CreatedAt <= cutoff)
            .ExecuteDeleteAsync();
        return Result.Success();
    }

    public async Task<Result> UpdatePositions(List<ChatMessage> messages)
    {
        foreach (var msg in messages)
        {
            await _db.ChatMessages
                .Where(m => m.Id == msg.Id)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(m => m.PositionX, msg.X)
                    .SetProperty(m => m.PositionY, msg.Y));
        }
        return Result.Success();
    }
}
