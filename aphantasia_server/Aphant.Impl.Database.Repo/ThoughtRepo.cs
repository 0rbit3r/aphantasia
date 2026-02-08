using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;

namespace Aphant.Impl.Database;

internal partial class DbRepository : IDataService
{
    public Task<Result<Guid>> CreateThought(Guid user, string title, string content, byte shape, List<Guid> links)
    {
        throw new NotImplementedException();
    }

    public Task<Result<Thought>> GetThoughtAsync(Guid id)
    {
        throw new NotImplementedException();
    }
}