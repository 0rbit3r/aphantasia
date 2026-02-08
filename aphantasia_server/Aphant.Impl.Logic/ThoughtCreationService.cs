using Aphant.Core.Dto.Results;
using Aphant.Core.Interface;

namespace Aphant.Impl.Logic;

internal partial class LogicService : ILogicService
{
    public Task<Result<Guid>> CreateThought(Guid user, string title, string content, byte shape)
    {
        throw new NotImplementedException();
    }
}