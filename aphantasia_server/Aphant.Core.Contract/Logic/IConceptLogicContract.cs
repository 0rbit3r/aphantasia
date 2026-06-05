using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;

namespace Aphant.Core.Contract.Logic;

public interface IConceptLogicContract
{
    Task<Result<Concept>> GetConcept(string tag);
}
