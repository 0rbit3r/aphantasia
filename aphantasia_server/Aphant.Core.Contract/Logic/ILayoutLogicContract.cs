using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract;

public interface ILayoutLogicContract
{
    Task<Result<List<ThoughtNode>>> RunFDL(List<ThoughtNode> thoughts, int iterations = 1);
}