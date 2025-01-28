using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.Errors
{
    internal class AuthValidation_EN : IAuthValidationMessages
    {
        public string EntityAlreadyExists => "{0} already exists in the system";

        public string AuthorizationError => "Could not authorize.";

        public string FailedLogin => "Login failed, check your credentials and try again.";

        public string InvalidEmail => "Invalid email address";

        public string InvalidPassword => "Password must be between {0} - {1} characters and must contain: Digit, Lowercase letter and Uppercase letter.";

        public string InvalidUsernameLength => "Username must be between {0} and {1} characters.";

        public string InvalidUsernameFormat => "Username must contain only english (or Czech) letters and spaces.";

        public string Email => "Email";

        public string Username => "Username";
    }
}
