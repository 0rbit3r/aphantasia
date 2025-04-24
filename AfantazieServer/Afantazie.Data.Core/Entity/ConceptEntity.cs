using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Entity
{
    public class ConceptEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Tag { get; set; } = "";

        [Required]
        public string Color { get; set; } = "#e0e0e0";

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        public ICollection<ThoughtEntity> Thoughts = new List<ThoughtEntity>();
    }
}
