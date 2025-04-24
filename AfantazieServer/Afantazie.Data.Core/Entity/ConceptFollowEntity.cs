using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Entity
{
    public class ConceptFollowEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ConceptId { get; set; }

        [Required]
        public virtual UserEntity User { get; set; } = null!;

        [Required]
        public virtual ConceptEntity Concept { get; set; } = null!;
    }
}
