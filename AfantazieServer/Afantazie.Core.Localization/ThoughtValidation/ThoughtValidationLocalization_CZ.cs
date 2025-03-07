using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.ThoughtValidation
{
    internal class ThoughtValidationLocalization_CZ : IThoughtValidationLocalization
    {
        public string InvalidContentLength => "- Obsah myšlenky musí mít mezi 5 a 1000 znaky";

        public string InvalidTitleLength => "- Název myšlenky musí mít mezi 1 a 50 znaky";
    }
}
