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

        public UserEntity Author { get; set; } = null!;

        public int SizeMultiplier { get; set; } = 0;

        [MaxLength(3000)]
        public required string Content { get; set; }

        public byte Shape { get; set; } = 0;

        // Outgoing links (links from this Thought to others)
        public ICollection<ThoughtReferenceEntity> Links { get; set; }
            = new List<ThoughtReferenceEntity>();

        // Incoming links (links from others to this Thought)
        public ICollection<ThoughtReferenceEntity> Backlinks { get; set; }
            = new List<ThoughtReferenceEntity>();

        public ICollection<HashtagEntity> Hashtags { get; set; }
            = new List<HashtagEntity>();
    }
}
