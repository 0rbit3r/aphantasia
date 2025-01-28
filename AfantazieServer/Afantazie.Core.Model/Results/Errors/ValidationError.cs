using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model.Results.Errors
{
    public class ValidationError : ErrorWithMessage
    {
        public override int Code => 400;

        public override string Message { get; }

        public ValidationError(string message)
        {
            Message = message;
        }

    }
}
