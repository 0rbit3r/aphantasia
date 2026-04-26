using Aphant.Core.Dto.Results;
using Aphant.Core.Contract.Data;
using Microsoft.Extensions.Logging;

namespace Aphant.Impl.Logic.Thoughts;

internal partial class ThoughtLogicService : IThoughtLogicContract
{
    public async Task<Result> DeleteThought(Guid thoughtId)
    {
        try
        {
            var thought = await _thoughtData.GetThoughtById(thoughtId);
            if (!thought.IsSuccess) return Error.NotFound();

            foreach (var linkedThought in thought.Payload!.Links)
            {
                await _thoughtData.DebumpThought(linkedThought.Id);
            }

            return await _thoughtData.DeleteThought(thoughtId);
        }
        catch (Exception e)
        {
            _log.LogError(e, "Failed to delete thought");
            return Error.General("Server error");
        }
    }
}