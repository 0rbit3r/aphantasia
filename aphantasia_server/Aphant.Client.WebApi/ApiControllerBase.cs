using Aphant.Core.Dto.Results;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Aphant.Client.WebApi
{
    public class ApiControllerBase : ControllerBase
    {
        protected string? Username
            => User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        protected int? UserId
            => int.TryParse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id
            : null;

        protected ActionResult ResponseFromError(Error error)
        {
            switch (error.Code)
            {
                case ErrorCode.Unauthorized: return Unauthorized(error.Message);
                case ErrorCode.BadRequest: return BadRequest(error.Message);
                case ErrorCode.NotFound: return NotFound(error.Message);
                default: return Problem(error.Message);
            }
        }
    }

}
