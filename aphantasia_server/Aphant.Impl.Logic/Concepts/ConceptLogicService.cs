using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Impl.Logic.Concepts;

internal class ConceptLogicService(IConceptDataContract _conceptData) : IConceptLogicContract
{
    public Task<Result<Concept>> GetConcept(string tag)
        => _conceptData.GetConceptWithChildren(tag);

    public Task<Result<ConceptGraph>> GetConceptGraph()
        => _conceptData.GetConceptGraph();
}
