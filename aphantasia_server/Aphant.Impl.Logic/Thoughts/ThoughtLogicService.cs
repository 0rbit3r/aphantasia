using Aphant.Core.Contract;
using Aphant.Core.Contract.Data;
using Aphant.Core.Dto.Results;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Logic.Thoughts;

internal partial class ThoughtLogicService : IThoughtLogicContract
{
    private readonly ILogger<ThoughtLogicService> _log;
    private readonly IThoughtDataContract _thoughtData;

    public ThoughtLogicService(ILogger<ThoughtLogicService> log, IThoughtDataContract thoughtData)
    {
        _log = log;
        _thoughtData = thoughtData;
    }

     public Task<Result<int>> HandleThoughtBump(Guid bumpedId, Guid bumperId)
    {
        throw new NotImplementedException();
    }

    public Task<Result<int>> HandleThoughtDebump(Guid debumpedId)
    {
        throw new NotImplementedException();
    }
}