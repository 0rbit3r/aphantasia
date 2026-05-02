using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IChatDataContract
{
    Task<Result<List<ChatMessage>>> GetActiveMessages();
    Task<Result<ChatMessage>> InsertMessage(Guid userId, string content, Guid? parentId, double x, double y);
    Task<Result> DeleteExpiredMessages();
    Task<Result> UpdatePositions(List<ChatMessage> messages);
}
