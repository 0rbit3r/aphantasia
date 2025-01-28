using Afantazie.Core.Localization.Errors;
using Afantazie.Core.Model.Results.Errors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Api.Controllers
{
    public class ApiControllerBase (
        IAuthValidationMessages _errorMessages
        ): ControllerBase
    {
        protected string? Username
            => User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        protected int? UserId
            => int.TryParse(User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id
            : null;

        protected ActionResult ResponseFromError(Error error)
        {
            // More specific errors first
            if (error == null)
            {
                throw new Exception();
            }
            if (error is AuthenticationError)
            {
                return Unauthorized(new { Error = _errorMessages.AuthorizationError });
            }
            if (error is AlreadyExistsError existsError)
            {
                return Conflict(
                    new {
                        Error = string.Format(_errorMessages.EntityAlreadyExists, existsError.EntityName)
                    });
            }
            if (error is ValidationError validationError)
            {
                return BadRequest(new { Error = validationError.Message} );
            }

            if (error is GeneralError generalError)
            {
                return StatusCode(generalError.Code, new { Error = generalError.Message });
            }

            if (error is ErrorWithMessage errorWithMessage)
            {
                return BadRequest(new { Error = errorWithMessage.Message });
            }
            
            return BadRequest(new { Error = "Missing proper Error conversion." });
        }
    }
}
