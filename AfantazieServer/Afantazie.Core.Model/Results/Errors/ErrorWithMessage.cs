using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model.Results.Errors
{
    public abstract class ErrorWithMessage : Error
    {
        public abstract string Message { get; }

        public override string ToString()
        {
            return Message;
        }
    }
}
