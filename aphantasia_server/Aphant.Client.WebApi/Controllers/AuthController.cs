using Aphant.Core.Dto;
using Aphant.Core.Contract;
using Microsoft.AspNetCore.Mvc;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController(
        IAuthContract authService
    ) : ApiControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterRequest body)
        {
            var result = await authService.Register(body.Username, body.Password, body.Email);
            return ResponseFromResult(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] LogInRequest body)
        {
            var result = await authService.LogIn(body.usernameOrEmail, body.Password);
            return ResponseFromResult(result);
        }
    }
}