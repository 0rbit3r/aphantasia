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


        protected ActionResult ResponseFromResult(Result result)
        {
            if (result.IsSuccess) return Ok(result);
            var error = result.Error!;
            switch (error.Code)
            {
                case ErrorCode.Unauthorized: return Unauthorized(result);
                case ErrorCode.BadRequest: return BadRequest(result);
                case ErrorCode.NotFound: return NotFound(result);
                default: return StatusCode(500, result);
            }
        }

        protected ActionResult<T> ResponseFromResult<T>(Result<T> result)
        {
            if (result.IsSuccess) return Ok(result);
            var error = result.Error!;
            switch (error.Code)
            {
                case ErrorCode.Unauthorized: return Unauthorized(result);
                case ErrorCode.BadRequest: return BadRequest(result);
                case ErrorCode.NotFound: return NotFound(result);
                default: return StatusCode(500, result);
            }
        }
    }

}
