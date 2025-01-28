using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model.Results.Errors
{
    /// <summary>
    /// Indicates that the entity already exists in the system.
    /// </summary>
    public class AlreadyExistsError : Error
    {
        public string EntityName { get; }

        public override int Code { get; } = 400;

        public AlreadyExistsError(string entityName)
        {
            EntityName = entityName;
        }
    }
}
