using Afantazie.Core.Localization.Errors;
using Afantazie.Presentation.Model.Dto.Auth;
using Afantazie.Service.Interface.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ApiControllerBase
    {
        private readonly IAuthenticationService _authService;

        public AuthController(IAuthenticationService authService, IAuthValidationMessages errorMessages) : base(errorMessages)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<RegisterResponseDto>> Register(RegisterRequestDto dto)
        {

            var result = await _authService.Register(dto.Username, dto.Email, dto.Password);

            if (result.IsSuccess)
            {
                return new RegisterResponseDto { Message = "success" };
            }
            return ResponseFromError(result.Error!);

        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto dto)
        {
            var result = await _authService.Login(dto.Email, dto.Password);
            if (!result.IsSuccess)
            {
                return ResponseFromError(result.Error!);
            }
            (var access, var refresh) = result.Payload;

            //// Create cookie options
            //var cookieOptions = new CookieOptions
            //{
            //    HttpOnly = true,
            //    //Secure = true, // Set to true in production
            //    SameSite = SameSiteMode.Strict,
            //    Expires = DateTimeOffset.UtcNow.AddHours(24)
            //};        

            //Response.Cookies.Append("Refresh", refresh, cookieOptions);

            return new LoginResponseDto { Token = access };
        }

        [HttpGet("test-auth")]
        [Authorize]
        public Task<ActionResult> TestAuth()
        {
            return Task.FromResult<ActionResult>(Ok());
        }
    }
}
