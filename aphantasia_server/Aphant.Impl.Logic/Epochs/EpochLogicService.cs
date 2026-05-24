using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;
using Aphant.Core.Contracta.Configuration;
using Aphant.Core.Dto.Results;
using Aphant.Impl.Logic.Thoughts;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aphant.Impl.Logic.Epochs;

internal partial class EpochLogicService : IEpochLogicContract
{
    private readonly ILogger<ThoughtLogicService> _log;
    private readonly IEpochDataContract _epochData;
    private readonly EpochOptions _epochOpts;

    public EpochLogicService(
        ILogger<ThoughtLogicService> log,
        IEpochDataContract epochData,
        IOptions<EpochOptions> options)
    {
        _log = log;
        _epochData = epochData;
        _epochOpts = options.Value;
    }

    public async Task<Result> CheckContextAndCreateEpoch()
    {
        var epochlessThoughtsRes = await _epochData.GetEpochAsync(-1);
        if (!epochlessThoughtsRes.IsSuccess) return epochlessThoughtsRes.Error!;

        if (epochlessThoughtsRes.Payload!.Thoughts.Count() < _epochOpts.ThoughtsPerEpoch)
            return Result.Success();

        var result = await _epochData.CreateEpoch(_epochOpts.ThoughtsPerEpoch);

        if (result.IsSuccess)
        {
            _log.LogInformation("New Epoch was created:  {id}", result.Payload!.Id);
            return Result.Success();
        }
        _log.LogError("Failed to create Epoch {msg}", result.Error!.Message);
        return result.Error!;
    }
}