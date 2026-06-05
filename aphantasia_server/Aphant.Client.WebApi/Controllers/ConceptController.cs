using Aphant.Core.Contract.Logic;
using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Microsoft.AspNetCore.Mvc;

namespace Aphant.Client.WebApi.Controllers;

[Route("api/concept")]
[ApiController]
public class ConceptController(IConceptLogicContract conceptLogic) : ApiControllerBase
{
    [HttpGet("{tag}")]
    public async Task<ActionResult<Result<Concept>>> GetConcept([FromRoute] string tag)
        => ResponseFromResult(await conceptLogic.GetConcept(tag));
}
