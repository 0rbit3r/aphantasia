using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Interface;

public interface ILogicService
{
    Task<Result<Guid>> CreateThought(Guid user, string title, string content, byte shape);
}
