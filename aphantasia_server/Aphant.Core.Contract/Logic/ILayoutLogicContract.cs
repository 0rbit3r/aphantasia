using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract;

public interface ILayoutLogicContract
{
    List<LayoutNode> LayoutNodes(List<LayoutNode> nodes, FdlLayoutOptions options, int iterations = 1);
    Task<Result> PrintLayout(string path, List<LayoutNode> nodes, FdlLayoutOptions options);
}
