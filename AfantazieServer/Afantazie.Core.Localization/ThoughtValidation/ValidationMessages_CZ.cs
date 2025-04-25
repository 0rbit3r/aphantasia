using Afantazie.Core.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.ThoughtValidation
{
    internal class ValidationMessages_CZ : IValidationMessages
    {
        public string InvalidContentLength => "- Obsah myšlenky musí mít mezi 5 a 3000 znaky";

        public string InvalidTitleLength => "- Název myšlenky musí mít mezi 1 a 50 znaky";

        public string SquareBracketsNotAllowed => "- Název myšlenky nesmí obsahovat hranaté závorky";

        public string BioTooLong => $"- Maximální délka popisu je {AfantazieConstants.MaxBioLength} znaků";
    }
}
