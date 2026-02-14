using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Aphant.Core.Contract.Data;

namespace Aphant.Impl.Database.Repo;

internal class EpochRepository : IEpochDataContract
{
    public Task<Result<Epoch>> GetEpochAsync(int id)
    {
        throw new NotImplementedException();
    }
}