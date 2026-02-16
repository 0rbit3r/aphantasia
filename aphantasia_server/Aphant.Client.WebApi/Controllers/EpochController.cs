using Aphant.Core.Dto;
using Aphant.Core.Contract;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract.Data;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("epochs")]
    [ApiController]
    public class EpochController(
        IEpochDataContract epochDataContract
    ) : ApiControllerBase
    {
        [HttpGet("{id?}")]
        public async Task<ActionResult<Result<Epoch>>> GetEpoch([FromRoute] int? id)
        {
            return ResponseFromResult(await epochDataContract.GetEpochAsync(id));
        }
    }
}