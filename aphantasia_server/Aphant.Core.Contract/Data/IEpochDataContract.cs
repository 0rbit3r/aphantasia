using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IEpochDataContract
{
    Task<Result<Epoch>> GetEpochAsync(int? id);
}
