using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Data;

public interface IConceptDataContract
{
    Task<Result<Concept>> GetConcept(string tag);

    Task<Result<Concept>> CreateConcept(string tag, string color);
    
    Task<Result> AddThoughtToConcept(Guid thought, string conceptTag);
}
