using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IThoughtLogicContract
{
    // Will attempt to create a new thought including executing conent parsing, validations etc.
    Task<Result<Guid>> PostThought(Guid userId, string title, string content, ThoughtShape shape);

    // Will attempt to delete a thought and debump linked thoughts
    Task<Result> DeleteThought(Guid thoughtId);
}
