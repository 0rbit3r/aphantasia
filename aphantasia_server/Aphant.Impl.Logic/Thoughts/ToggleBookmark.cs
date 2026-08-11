using Aphant.Core.Dto.Results;
using Aphant.Core.Contract.Data;
using Microsoft.Extensions.Logging;
using Aphant.Core.Contract.Logic;

namespace Aphant.Impl.Logic.Thoughts;

internal partial class ThoughtLogicService : IThoughtLogicContract
{
    public async Task<Result<bool>> ToggleBookmark(Guid thoughtId, Guid userId)
    {
        var toggleResult = await _thoughtData.ToggleBookmark(thoughtId, userId);
        if (!toggleResult.IsSuccess) return toggleResult.Error!;

        var nowBookmarked = toggleResult.Payload;

        // Only notify when a bookmark is added (not removed), and never self-notify.
        if (nowBookmarked)
        {
            var thought = await _thoughtData.GetThoughtById(thoughtId);
            if (thought.IsSuccess && thought.Payload!.Author.Id != userId)
                await _notificationData.InsertNotification(thought.Payload.Author.Id, thoughtId, userId, null);
        }

        return nowBookmarked;
    }
}
