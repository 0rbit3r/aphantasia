using System.Reflection.Metadata.Ecma335;
using Aphant.Core.Dto;
using Aphant.Core.Interface;
using Microsoft.AspNetCore.Mvc;

namespace Aphant.Client.WebApi.Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController(
        IAuthService authService
    ): ApiControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult> RegisterAsync([FromBody] RegisterRequest body)
        {
            Console.WriteLine(body.Username);
            var result = await authService.RegisterAsync(body.Username, body.Password, body.Email);
            if (result.IsSuccess)
                return Ok();
            Console.WriteLine(result.Error!.Message);
            return ResponseFromError(result.Error!);
        }
    }
}