using Aphant.Core.Dto;
using Aphant.Core.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("thoughts")]
    [ApiController]
    public class ThoughtController(
        IDataService thoughtRepo
        // ILogicService logicService
    ): ApiControllerBase
    {
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Thought>> GetThoughtById([FromRoute] Guid id)
        {
            return ResponseFromResult(await thoughtRepo.GetThoughtAsync(id));
        }
        // [HttpPost]
        // public async Task<ActionResult<Thought>> CreateThought([FromBody] CreateThoughtRequest body)
        // {
            
        //     return await logicService.CreateThought(
        //         );
        // }
    }
}
