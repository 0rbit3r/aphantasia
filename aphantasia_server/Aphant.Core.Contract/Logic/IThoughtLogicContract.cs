using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Logic;

public interface IThoughtLogicContract
{
    // Will attempt to create a new thought including executing conent parsing, validations etc.
    Task<Result<Guid>> PostThought(Guid userId, string title, string content, ThoughtShape shape, double positionX, double positionY);

    // Will attempt to delete a thought and debump linked thoughts
    Task<Result> DeleteThought(Guid thoughtId);

    // Toggles the current user's bookmark on a thought and notifies the author when added
    Task<Result<bool>> ToggleBookmark(Guid thoughtId, Guid userId);

}
