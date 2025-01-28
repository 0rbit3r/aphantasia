using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Core.Model
{
    public class ThoughtsTemporalFilter
    {
        public TemporalFilterType TemporalFilterType { get; set; }

        public int? ThoughtId { get; set; }

        public int Amount { get; set; }
    }

    public enum TemporalFilterType
    {
        BeforeId,
        AfterId,
        AroundId,
        Latest
    }
}
