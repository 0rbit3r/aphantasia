using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Entity
{
    public class ThoughtEntity : IEntity
    {
        [Key]
        public int Id { get; set; }

        public required string Title { get; set; }

        public required DateTime DateCreated { get; set; }

        public required int AuthorId { get; set; }

        public UserEntity Author { get; set; } = null!; // todo rename to author...

        public int SizeMultiplier { get; set; } = 0;

        public required string Content { get; set; }

        // Outgoing links (links from this Thought to others)
        public virtual ICollection<ThoughtReferenceEntity> Links { get; set; }
            = new List<ThoughtReferenceEntity>();

        // Incoming links (links from others to this Thought)
        public virtual ICollection<ThoughtReferenceEntity> Backlinks { get; set; }
            = new List<ThoughtReferenceEntity>();
    }
}
