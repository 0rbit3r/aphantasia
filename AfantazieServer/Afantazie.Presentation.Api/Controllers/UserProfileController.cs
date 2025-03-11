using Afantazie.Core.Localization.Errors;
using Afantazie.Core.Model;
using Afantazie.Presentation.Model.Dto;
using Afantazie.Service.Interface.Profiles;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UserProfileController : ApiControllerBase
    {
        private readonly IUserProfileService _userProfileService;
        public UserProfileController(
            IAuthValidationMessages authValidationMessages,
            IUserProfileService profileService)
            : base(authValidationMessages)
        {
            _userProfileService = profileService;
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<ProfileDto>> GetUserProfile(string username)
        {
            var profileResult = await _userProfileService.GetUserProfile(username, null!);

            if (!profileResult.IsSuccess)
            {
                return ResponseFromError(profileResult.Error!);
            }

            return profileResult.Payload.Adapt<ProfileDto>();


        }
    }
}
