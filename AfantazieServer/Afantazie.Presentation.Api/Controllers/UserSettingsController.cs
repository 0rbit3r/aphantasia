using Afantazie.Core.Localization.Errors;
using Afantazie.Presentation.Model.Dto;
using Afantazie.Service.Interface.UserSettings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Api.Controllers
{
    [ApiController]
    [Route("api/user-settings")]
    public class UserSettingsController: ApiControllerBase
    {
        private readonly IUserSettingsService _service;

        public UserSettingsController(IUserSettingsService service, IAuthValidationMessages errors)
            : base(errors)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> UpdateSettings([FromBody] UserSettingsDto dto)
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var colorResult = await _service.UpdateColor(UserId.Value, dto.Color);

            if (!colorResult.IsSuccess)
            {
                return ResponseFromError(colorResult.Error!);
            }

            var maxThoughtsResult = await _service.UpdateMaxThoughts(UserId.Value, dto.MaxThoughts);

            if (maxThoughtsResult.IsSuccess)
            {
                return Ok();
            }

            return ResponseFromError(colorResult.Error!);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserSettingsDto>> GetSettings()
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var colorResult = await _service.GetColor(UserId.Value);
            var maxThoughtsResult = await _service.GetMaxThoughts(UserId.Value);

            if (colorResult.IsSuccess)
            {
                return new UserSettingsDto
                {
                    Color = colorResult.Payload!,
                    Username = User.Identity?.Name ?? "Unknown",
                    MaxThoughts = maxThoughtsResult.Payload!
                };
            }

            return ResponseFromError(colorResult.Error!);
        }
    }
}
