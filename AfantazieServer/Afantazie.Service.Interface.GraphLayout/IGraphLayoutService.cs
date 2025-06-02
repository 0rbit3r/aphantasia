using Afantazie.Core.Model.Results;

namespace Afantazie.Service.Interface.GraphLayout;

public interface IGraphLayoutService
{
    public Task<Result> RunFDLAsync(int frames);

    public Task<Result> RandomizePositionsAsync();

    Task<Result> PrintImage();
}
