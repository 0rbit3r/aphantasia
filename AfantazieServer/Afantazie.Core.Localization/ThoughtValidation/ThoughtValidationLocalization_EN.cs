using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.ThoughtValidation
{
    internal class ThoughtValidationLocalization_EN : IThoughtValidationLocalization
    {
        public string InvalidContentLength => "- Content must be between 5 and 1000 characters long";

        public string InvalidTitleLength => "- Title must be between 1 and 100 characters long";
    }
}
