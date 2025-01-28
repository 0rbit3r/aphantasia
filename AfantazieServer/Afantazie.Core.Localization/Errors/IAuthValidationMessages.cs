using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.Errors
{
    public interface IAuthValidationMessages
    {
        string Email { get; }

        string Username { get; }

        string EntityAlreadyExists { get; }

        string AuthorizationError { get; }

        string FailedLogin { get; }

        string InvalidEmail { get; }

        string InvalidPassword { get; }

        string InvalidUsernameLength { get; }

        string InvalidUsernameFormat { get; }

    }
}
