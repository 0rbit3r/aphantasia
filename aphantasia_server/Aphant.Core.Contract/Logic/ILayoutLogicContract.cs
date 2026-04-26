using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract;

public interface ILayoutLogicContract
{
    Task<Result<List<ThoughtNode>>> LayoutThoughts(List<ThoughtNode> thoughts, int iterations = 1);
    Task<Result> PrintLayout(string path, int? epoch);
}