using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Logic;

public interface IEpochLogicContract
{
    /// <summary>
    /// Will handle automatic Epoch creation if the number of epoch-less thoughts grows over the limit
    /// </summary>
    Task<Result> CheckContextAndCreateEpoch();
}
