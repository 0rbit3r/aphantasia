using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Aphant.Core.Contract.Data;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("users")]
    [ApiController]
    public class UserController(
        IUserDataContract _userData
        // IUserLogicContract _thoughtLogic
    ) : ApiControllerBase
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<Result<User>>> GetUserById([FromRoute] Guid id)
        {
            return ResponseFromResult(await _userData.GetUserById(id));
        }
    }
}
