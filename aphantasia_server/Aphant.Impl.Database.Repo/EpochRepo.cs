using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;

namespace Aphant.Impl.Database;

internal partial class DbRepository : IDataService
{
    public Task<Result<Epoch>> GetEpochAsync(Guid id)
    {
        throw new NotImplementedException();
    }
}