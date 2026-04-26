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

            foreach (var link in thought.Payload!.Links)
            {
                var target = await _thoughtData.GetThoughtNodeById(link.Id);
                if (!target.IsSuccess) continue;

                // Self-links were never bumped
                if (target.Payload!.Author.Id == thought.Payload.Author.Id)
                    continue;

                // Only debump if this was the author's only reply to the target
                // (thought is still in DB here, so count > 1 means there are other replies)
                var replies = await _thoughtData.GetRepliesOfThought(link.Id);
                var authorReplies = replies.Payload?.Count(r => r.Author.Id == thought.Payload.Author.Id) ?? 0;
                if (authorReplies > 1)
                    continue;

                await _thoughtData.DebumpThought(link.Id);
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