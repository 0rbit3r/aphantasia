using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Entity
{
    public class SavedThoughtEntity
    {
        public int Id { get; set; }

        public int ThoughtId { get; set; }

        public int UserId { get; set; }

        [Required]
        public ThoughtEntity Thought { get; set; } = null!;

        [Required]
        public UserEntity User { get; set; } = null!;

    }
}
