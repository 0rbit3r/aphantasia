using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model.Results.Errors
{
    /// <summary>
    /// Indicates that a non-specific error occurred.
    /// Should be used sparingly.
    /// </summary>
    public class GeneralError : ErrorWithMessage
    {
        public override string Message { get; } = "";
        public override int Code { get; }

        public GeneralError(int code, string message)
        {
            Code = code;
            Message = message;
        }
    }
}
