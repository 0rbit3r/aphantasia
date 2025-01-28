using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model.Results.Errors
{
    /// <summary>
    /// Signifies that the user is not authenticated for the requested operation.
    /// </summary>
    public class AuthenticationError : Error
    {
        public AuthenticationError()
        {
        }

        public override int Code { get; } = 401;
    }

    public class AuthenticationErrorWithMessage : ErrorWithMessage
    {
        public AuthenticationErrorWithMessage(string message)
        {
            Message = message;
        }

        public override int Code { get; } = 401;
        public override string Message { get; }
    }   
}
