using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;
using Aphant.Impl.Database.Entity;

namespace Aphant.Impl.Database.Repo;

internal class ThoughtRepository(AphantasiaDataContext _db) : IThoughtDataContract
{
    public async Task<Result<Thought>> GetThoughtById(Guid id)
    {
        var thought = await _db.Thoughts
            .Select(ThoughtMapper.ToDtoFullExpr)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (thought is null) return Error.NotFound();
        return thought;
    }

    public async Task<Result<ThoughtTitle>> GetThoughtTitleById(Guid id)
    {
        var thought = await _db.Thoughts
            .Select(ThoughtMapper.ToDtoTitleExpr)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (thought is null) return Error.NotFound();
        return thought;
    }

    public async Task<Result<ThoughtNode>> GetThoughtNodeById(Guid id)
    {
        var thought = await _db.Thoughts
            .Select(ThoughtMapper.ToDtoNodeExpr)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (thought is null) return Error.NotFound();
        return thought;
    }

    public async Task<Result> DeleteThought(Guid id)
    {
        var thought = await _db.Thoughts.FirstOrDefaultAsync(t => t.Id == id);
        if (thought is null) return Error.NotFound();

        _db.Remove(thought);
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

    public async Task<Result<List<ThoughtNode>>> GetRepliesOfThought(Guid id)
    {
        return await _db.Thoughts
                .Where(t => t.Links.Any(l => l.TargetId == id))
                .Select(ThoughtMapper.ToDtoNodeExpr)
                .ToListAsync();
    }

    public async Task<Result<Guid>> InsertThought(Guid userId, string title, string content, ThoughtShape shape)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
            return Error.BadRequest("User with that id doesn't exist");

        var entity = new ThoughtEntity
        {
            Id = Guid.CreateVersion7(),
            Title = title,
            Content = content,
            AuthorId = userId,
            Color = user.Color,
            Shape = shape,
            DateCreated = DateTime.UtcNow
        };
        _db.Thoughts.Add(entity);
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

    public async Task<Result> InsertThoughtReference(Guid SourceId, Guid TargetId)
    {
        _db.ThoughtReferences.Add(new ThoughtReferenceEntity()
        {
            SourceId = SourceId,
            TargetId = TargetId
        });
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

    public async Task<Result> BumpThought(Guid id)
    {
        var thought = await _db.Thoughts.SingleOrDefaultAsync(t => t.Id == id);
        if (thought is null) return Error.NotFound();
        thought.SizeMultiplier += 1;

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

    public async Task<Result> DebumpThought(Guid id)
    {
        var thought = await _db.Thoughts.SingleOrDefaultAsync(t => t.Id == id);
        if (thought is null) return Error.NotFound();
        thought.SizeMultiplier -= 1;

        if (thought.SizeMultiplier < 0)
            thought.SizeMultiplier = 0; // Should not happen ...often

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
