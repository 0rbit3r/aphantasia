using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Localization.ThoughtValidation
{
    public interface IValidationMessages
    {
        string InvalidContentLength { get; }

        string InvalidTitleLength { get; }

        string SquareBracketsNotAllowed { get; }

        string BioTooLong { get; }
    }
}
