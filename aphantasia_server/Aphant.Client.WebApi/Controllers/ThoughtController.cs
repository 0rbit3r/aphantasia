using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Aphant.Core.Contract.Data;
using Microsoft.Extensions.Logging;
using Aphant.Core.Contract.Logic;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("api/thoughts")]
    [ApiController]
    public class ThoughtController(
        IThoughtDataContract _thoughtData,
        IThoughtLogicContract _thoughtLogic,
        ILogger<ThoughtController> _log
    ) : ApiControllerBase
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<Result<Thought>>> GetThoughtById([FromRoute] Guid id)
        {
            return ResponseFromResult(await _thoughtData.GetThoughtById(id));
        }

        [HttpGet("{id}/neighborhood")]
        public async Task<ActionResult<Result<List<ThoughtNode>>>> GetThoughtNeighborhood(
            [FromRoute] Guid id,
            [FromQuery] int depth = 1,
            [FromQuery] int limit = 100)
        {
            return ResponseFromResult(await _thoughtData.GetThoughtNeighborhood(id, depth, limit));
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Result<Guid>>> PostThought([FromBody] CreateThoughtRequest body)
        {
            if (UserIdClaim is null) return ResponseFromResult(Error.Unauthorized("Invalid token"));

            return ResponseFromResult(
                await _thoughtLogic.PostThought(
                    UserIdClaim.Value,
                    body.Title,
                    body.Content,
                    body.Shape));
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult<Result>> DeleteThought([FromRoute] Guid id)
        {
            if (UserIdClaim is null) return ResponseFromResult(Error.Unauthorized());
            _log.LogInformation("Attempting to delete thought {id} by user {user}", id, UserIdClaim);

            var thought = await _thoughtData.GetThoughtById(id);
            if (!thought.IsSuccess) return ResponseFromResult(Error.NotFound());

            if (thought.Payload!.Author.Id != UserIdClaim) return ResponseFromResult(Error.Unauthorized());

            _log.LogInformation("Thought deleted");

            return ResponseFromResult(await _thoughtLogic.DeleteThought(id));
        }
    }
}
