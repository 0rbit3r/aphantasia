using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.Errors
{
    internal class AuthValidation_CZ : IAuthValidationMessages
    {
        public string Email => "Email";

        public string Username => "Username";

        public string EntityAlreadyExists => "{0} už v systému existuje";

        public string AuthorizationError => "Chyba autorizace";

        public string FailedLogin => "Přihlášení selhalo, zkontroluj údaje a zkus to znovu";

        public string InvalidEmail => "Neplatný e-mail";

        public string InvalidPassword => "Heslo musí mít délku {0} - {1} znaků a musí obsahovat: Číslici, Malé písmeno a Velké písmeno.";


        public string InvalidUsernameLength => "Délka jména musí být mezi {0} a {1}";

        public string InvalidUsernameFormat => "Jméno musí obsahovat pouze česká písmena a mezery";
    }
}
