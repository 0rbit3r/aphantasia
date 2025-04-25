using Afantazie.Core.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.ThoughtValidation
{
    internal class ValidationMessages_EN : IValidationMessages
    {
        public string InvalidContentLength => "- Content must be between 5 and 3000 characters long";

        public string InvalidTitleLength => "- Title must be between 1 and 50 characters long";

        public string SquareBracketsNotAllowed => "- Square brackets are not allowed in the title";

        public string BioTooLong => $"- Bio must be between 0 and {AfantazieConstants.MaxBioLength} characters long";
    }
}
