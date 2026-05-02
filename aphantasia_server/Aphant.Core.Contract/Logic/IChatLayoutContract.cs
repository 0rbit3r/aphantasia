using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Logic;

public interface IChatLayoutContract
{
    Task<Result<List<ChatMessage>>> LayoutChatMessages(List<ChatMessage> messages, int iterations = 1);
}
