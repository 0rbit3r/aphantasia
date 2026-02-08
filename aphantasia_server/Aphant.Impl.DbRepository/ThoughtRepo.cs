using Aphant.Core.Database.Mapping;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;
using Microsoft.EntityFrameworkCore;

namespace Aphant.Impl.DbRepository;

internal partial class DatabaseRepository : IDataService
{
    public Task<Result<Guid>> CreateThought(Guid user, string title, string content, byte shape, List<Guid> links)
    {
        throw new NotImplementedException();
    }

    public async Task<Result<Thought>> GetThoughtAsync(Guid id)
    {
        var thought = await _db.Thoughts
        .Select(ThoughtMapper.ToDtoFullExpr)
        .FirstOrDefaultAsync(t => t.Id == id);

        if (thought is null) return Error.NotFound();

        return thought;
    }

    public Task<Result<User>> GetUserById(Guid id)
    {
        throw new NotImplementedException();
    }

}