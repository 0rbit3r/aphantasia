using Aphant.Core.Dto;
using Aphant.Core.Dto.Results;
using Aphant.Core.Contract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Aphant.Core.Contract.Data;
using Aphant.Core.Contract.Logic;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserController(
        IUserDataContract _userData,
        IUserLogicContract _userLogic
    ) : ApiControllerBase
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<Result<User>>> GetUserById([FromRoute] Guid id)
        {
            return ResponseFromResult(await _userData.GetUserById(id));
        }

        [HttpGet("{id}/profile")]
        public async Task<ActionResult<Result<UserProfile>>> GetUserProfile([FromRoute] Guid id)
        {
            return ResponseFromResult(await _userLogic.GetUserProfile(id));
        }

        [HttpGet("{id}/settings")]
        [Authorize]
        public async Task<ActionResult<Result<UserSettings>>> GetUserSettings([FromRoute] Guid id)
        {
            if (id != UserIdClaim)
                return ResponseFromResult(Error.Unauthorized());

            return ResponseFromResult(await _userData.GetSettings(id));
        }

        [HttpPost("{id}/settings")]
        [Authorize]
        public async Task<ActionResult<Result<UserSettings>>> UpdateUserSettings(
            [FromRoute] Guid id, [FromBody] UserSettings settings)
        {
            if (id != UserIdClaim)
                return ResponseFromResult(Error.Unauthorized());

            return ResponseFromResult(await _userLogic.UpdateUserSettings(settings));
        }
    }
}
