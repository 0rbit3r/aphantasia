using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Aphant.Core.Contract.Data;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("thoughts")]
    [ApiController]
    public class ThoughtController(
        IThoughtDataContract _thoughtData,
        IThoughtLogicContract _thoughtLogic
    ) : ApiControllerBase
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<Result<Thought>>> GetThoughtById([FromRoute] Guid id)
        {
            return ResponseFromResult(await _thoughtData.GetThoughtById(id));
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Result<Guid>>> PostThought([FromBody] CreateThoughtRequest body)
        {
            if (UserId is null) return ResponseFromResult(Error.Unauthorized("Invalid token"));

            return ResponseFromResult(
                await _thoughtLogic.PostThought(
                    UserId.Value,
                    body.Title,
                    body.Content,
                    body.Shape));
        }
    }
}
