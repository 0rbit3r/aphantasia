using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Entity
{
    [PrimaryKey(nameof(ThoughtId), nameof(ConceptId))]
    public class ThoughtConceptEntity
    {
        public int ThoughtId { get; set; }

        public ThoughtEntity Thought { get; set; } = null!;

        public int ConceptId { get; set; }

        public ConceptEntity Concept { get; set; } = null!;
    }
}
