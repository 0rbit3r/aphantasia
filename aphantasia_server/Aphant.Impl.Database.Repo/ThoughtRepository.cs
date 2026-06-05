using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;
using Aphant.Impl.Database.Entity;
using System.Reflection.Metadata.Ecma335;

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

    public async Task<Result<Guid>> InsertThought(Guid userId, string title, string content, ThoughtShape shape, double positionX, double positionY)
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
            DateCreated = DateTime.UtcNow,
            PositionX = positionX,
            PositionY = positionY
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
            thought.SizeMultiplier = 0; // Should not happen, but still...

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

    public async Task<Result<List<ThoughtNode>>> GetThoughtNeighborhood(Guid id, int depth = 1, int limit = 100)
    {
        depth = Math.Clamp(depth, 1, 3);
        limit = Math.Clamp(limit, 1, 3000);

        var visited = new HashSet<Guid> { id };
        var frontier = new HashSet<Guid> { id };

        for (int d = 0; d < depth && visited.Count < limit; d++)
        {
            var neighborPairs = await _db.ThoughtReferences
                .Where(r => frontier.Contains(r.SourceId) || frontier.Contains(r.TargetId))
                .Select(r => new { r.SourceId, r.TargetId })
                .ToListAsync();

            var nextFrontier = new HashSet<Guid>();
            foreach (var pair in neighborPairs)
            {
                if (!visited.Contains(pair.SourceId)) nextFrontier.Add(pair.SourceId);
                if (!visited.Contains(pair.TargetId)) nextFrontier.Add(pair.TargetId);
            }

            var remaining = limit - visited.Count;
            foreach (var n in nextFrontier.Take(remaining))
                visited.Add(n);

            frontier = nextFrontier.Where(visited.Contains).ToHashSet();
            if (frontier.Count == 0) break;
        }

        var result = await _db.Thoughts
            .Where(t => visited.Contains(t.Id))
            .Select(ThoughtMapper.ToDtoNodeExpr)
            .ToListAsync();

        if (!result.Any())
            return Error.NotFound();

        return result;
    }

    public async Task<Result<List<ThoughtNode>>> GetUserProfileThoughts(Guid userId, int? page, int? pageSize)
    {
        pageSize ??= 500; // todo - config

        IQueryable<ThoughtEntity> query = _db.Thoughts
            .Where(t => t.AuthorId == userId || t.Backlinks.Count(bl => bl.SourceThought.AuthorId == userId) > 0)
            .OrderBy(t => t.Id);

        if (page is not null)
            query = query
                .Skip((page.Value - 1) * pageSize.Value)
                .Take(pageSize.Value);
        else
            query = query
                .OrderByDescending(t => t.Id)
                .Take(pageSize.Value)
                .OrderBy(t => t.Id);

        return await query.Distinct().Select(ThoughtMapper.ToDtoNodeExpr).ToListAsync();
    }
}
