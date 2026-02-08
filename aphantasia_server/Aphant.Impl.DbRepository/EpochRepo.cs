using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;

namespace Aphant.Impl.DbRepository;

internal partial class DatabaseRepository : IDataService
{
    public Task<Result<Epoch>> GetEpochAsync(int id)
    {
        throw new NotImplementedException();
    }
}