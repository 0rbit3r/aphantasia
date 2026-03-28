using Aphant.Core.Contract.Data;
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
}