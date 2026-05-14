using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IThoughtDataContract
{
    Task<Result<Thought>> GetThoughtById(Guid id);
    Task<Result<ThoughtTitle>> GetThoughtTitleById(Guid id);
    Task<Result<ThoughtNode>> GetThoughtNodeById(Guid id);
    Task<Result<List<ThoughtNode>>> GetRepliesOfThought(Guid id);

    Task<Result<Guid>> InsertThought(
        Guid user,
        string title,
        string content,
        ThoughtShape shape);

    Task<Result> InsertThoughtReference(Guid SourceId, Guid TargetId);

    Task<Result> DeleteThought(Guid id);

    Task<Result> BumpThought(Guid id);

    Task<Result> DebumpThought(Guid id);

    /// <summary>
    /// Returns thoughts of the given user with any thoughts they replied to.
    /// </summary>
    Task<Result<List<ThoughtNode>>> GetUserProfileThoughts(Guid userId, int? count, int? pageSize);
}
