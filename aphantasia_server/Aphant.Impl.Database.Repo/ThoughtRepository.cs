using Aphant.Impl.Database;
using Aphant.Core.Contract;
using Microsoft.Extensions.Logging;
using Aphant.Core.Contract.Data;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Database.Mapping;
using Microsoft.EntityFrameworkCore;
using Aphant.Impl.Database.Entity;

namespace Aphant.Impl.Database.Repo;

internal class ThoughtRepository(
    AphantasiaDataContext db,
    ILogger<AphantasiaDataContext> log
    ) : IThoughtDataContract
{
    private readonly AphantasiaDataContext _db = db;
    private readonly ILogger<AphantasiaDataContext> _log = log;


    public async Task<Result<Thought>> GetThoughtById(Guid id)
    {
        try
        {
            var thought = await _db.Thoughts
                .Select(ThoughtMapper.ToDtoFullExpr)
                .AsSplitQuery()
                .FirstOrDefaultAsync(t => t.Id == id);

            if (thought is null) return Error.NotFound();

            return thought;
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to fetch thought to database.");
            return Error.General("Server error");
        }
    }

    public async Task<Result<ThoughtLight>> GetThoughtLightById(Guid id)
    {
        try
        {
            var thought = await _db.Thoughts
                .Select(ThoughtMapper.ToDtoLightExpr)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (thought is null) return Error.NotFound();

            return thought;
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to fetch thought to database.");
            return Error.General("Server error");
        }
    }
    public Task<Result> DeleteThought(Guid id)
    {
        throw new NotImplementedException();
    }
    public async Task<Result<List<ThoughtLight>>> GetRepliesOfThought(Guid id)
    {
        try
        {
            return await _db.Thoughts
                    .Where(t => t.Links.Any(l => l.TargetId == id))
                    .Select(ThoughtMapper.ToDtoLightExpr)
                    .ToListAsync();
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to fetch thought replies from database.");
            return Error.General("Server error");
        }
    }

    public async Task<Result<Guid>> InsertThought(Guid userId, string title, string content, ThoughtShape shape)
    {
        try
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
                DateCreated = DateTime.UtcNow
            };
            _db.Thoughts.Add(entity);
            _db.SaveChanges();
            return Result.Success(entity.Id);
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to insert thought to database.");
            return Error.General("Server error");
        }
    }

    public async Task<Result> InsertThoughtReference(Guid SourceId, Guid TargetId)
    {
        try
        {
            _db.ThoughtReferences.Add(new ThoughtReferenceEntity()
            {
                SourceId = SourceId,
                TargetId = TargetId
            });
            await _db.SaveChangesAsync();
            return Result.Success();
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to insert thought reference to database: {src} -> {tgt}",
                SourceId, TargetId);
            return Error.General("Server error");
        }
    }

    public async Task<Result> BumpThought(Guid id)
    {
        try
        {
            var thought = await _db.Thoughts.SingleOrDefaultAsync(t => t.Id == id);
            if (thought is null) return Error.NotFound();
            thought.SizeMultiplier += 1;

            await _db.SaveChangesAsync();
            return Result.Success();
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to bump thought {id}", id);
            return Error.General("Server error");
        }
    }
}