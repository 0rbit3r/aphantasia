using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IThoughtDataContract
{
    Task<Result<Thought>> GetThoughtById(Guid id);
    Task<Result<ThoughtLight>> GetThoughtLightById(Guid id);
    Task<Result<List<ThoughtLight>>> GetRepliesOfThought(Guid id);

    Task<Result<Guid>> InsertThought(
        Guid user,
        string title,
        string content,
        ThoughtShape shape);

    Task<Result> InsertThoughtReference(Guid SourceId, Guid TargetId);

    Task<Result> DeleteThought(Guid id);

    Task<Result> BumpThought(Guid id);
}
