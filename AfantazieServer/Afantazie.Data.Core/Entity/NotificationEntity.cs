using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model.Entity
{
    public class NotificationEntity
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required]
        public UserEntity User { get; set; } = null!;

        public int? ThoughtId { get; set; }

        public ThoughtEntity? Thought { get; set; } = null!;

        public byte Type { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
    }
}
