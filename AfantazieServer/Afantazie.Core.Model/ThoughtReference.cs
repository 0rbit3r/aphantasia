using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model
{
    public class ThoughtReference
    {
        public int Id { get; set; }

        public int SourceId { get; set; }

        public int TargetId { get; set; }
    }
}
