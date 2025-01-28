using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model.Results.Errors
{
    public class NotFoundError : Error
    {
        public override int Code => 404;
    }
}
